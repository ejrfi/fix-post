import path from "path";
import { fileURLToPath } from "url";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { createServer } from "http";
import * as dotenv from "dotenv";
import { InitializationService } from "./services/initializationService";
import { 
  ensureAppSettingsTable, 
  ensureAuditLogsTable, 
  ensureCashierShiftSnapshotColumns, 
  ensureCashierShiftsTable, 
  ensureCustomerMembershipSchema, 
  ensureDiscountsSchema, 
  ensureEnterpriseInventorySchema, 
  ensureMultiUnitColumns, 
  ensureProductPriceAuditsTable, 
  ensureReturnRefundMethodColumn, 
  ensureReturnsEnhancementsSchema, 
  ensureSalesShiftIdColumn, 
  ensureSalesStatusColumns, 
  ensureShiftReportsSchema, 
  ensureSuspendedSalesTable 
} from "./db";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Helper for logging
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// Security & Parsing Middleware
app.use(express.json({
  limit: "50mb",
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && res.statusCode >= 400) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

// Global Error Handler (This will be moved to the end)
function globalErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error("❌ Global Error Handler:", err);
  res.status(status).json({ message, status });
}

// Process-level Error Handling
process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION:", err);
  // Optional: Graceful shutdown if needed
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ UNHANDLED REJECTION at:", promise, "reason:", reason);
});

async function startServer() {
  try {
    log("Starting system initialization...");

    // 1. Health check (Very important for Railway/Load Balancers)
    app.get("/health", (_, res) => res.status(200).send("OK"));

    // 2. Database Schema Sync (Background)
    (async () => {
      try {
        log("Syncing database schema...");
        await Promise.all([
          ensureMultiUnitColumns(),
          ensureProductPriceAuditsTable(),
          ensureSuspendedSalesTable(),
          ensureCashierShiftsTable(),
          ensureCashierShiftSnapshotColumns(),
          ensureSalesShiftIdColumn(),
          ensureSalesStatusColumns(),
          ensureReturnRefundMethodColumn(),
          ensureReturnsEnhancementsSchema(),
          ensureShiftReportsSchema(),
          ensureAuditLogsTable(),
          ensureAppSettingsTable(),
          ensureDiscountsSchema(),
          ensureEnterpriseInventorySchema(),
          ensureCustomerMembershipSchema()
        ]);
        log("Database schema synced.");

        // Initial Data
        const initResult = await InitializationService.ensureDefaultAdmin();
        if (initResult.created) {
          log("✅ Default admin created (admin / admin123)");
        }
      } catch (dbErr) {
        console.error("❌ Database initialization error:", dbErr);
      }
    })();

    // 3. Register Routes
    await registerRoutes(httpServer, app);
    log("Routes registered.");

    // 4. Production Static Files & Catch-all
    if (process.env.NODE_ENV === "production") {
      // In ES modules when bundled, __dirname might point to dist/
      const publicPath = path.resolve(__dirname, "public");
      log(`Serving static files from: ${publicPath}`);
      
      app.use(express.static(publicPath));
      app.get("*", (req, res) => {
        if (req.path.startsWith("/api")) {
          return res.status(404).json({ message: "API route not found" });
        }
        res.sendFile(path.resolve(publicPath, "index.html"));
      });
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // 5. Global Error Handler (MUST BE LAST)
    app.use(globalErrorHandler);

    // 6. Start Listening
    const envPort = process.env.PORT;
    const PORT = envPort ? Number(envPort) : 8080;
    
    if (!envPort) {
      log("⚠️ Warning: process.env.PORT is not set, using default 8080. This might fail on Railway!");
    } else {
      log(`✅ Detected process.env.PORT: ${envPort}`);
    }

    httpServer.listen(PORT, "0.0.0.0", () => {
      log(`🚀 Server ready on port ${PORT} (binding 0.0.0.0)`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
