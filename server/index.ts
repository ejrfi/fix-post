import path from "path";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { InitializationService } from "./services/initializationService";
import { ensureAppSettingsTable, ensureAuditLogsTable, ensureCashierShiftSnapshotColumns, ensureCashierShiftsTable, ensureCustomerMembershipSchema, ensureDiscountsSchema, ensureEnterpriseInventorySchema, ensureMultiUnitColumns, ensureProductPriceAuditsTable, ensureReturnRefundMethodColumn, ensureReturnsEnhancementsSchema, ensureSalesShiftIdColumn, ensureSalesStatusColumns, ensureShiftReportsSchema, ensureSuspendedSalesTable } from "./db";

const app = express();
console.log("Starting server...");
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "50mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log("PORT FROM ENV:", process.env.PORT);

  const PORT = process.env.PORT || 8080;
  // if (!PORT) {
  //   throw new Error("PORT environment variable not found. Railway MUST inject this.");
  // }

  // 1. Health check endpoint (Placed at the very top to ensure availability)
  app.get("/health", (_, res) => {
    res.status(200).send("OK");
  });

  // 2. Start listening IMMEDIATELY
  httpServer.listen(Number(PORT), "0.0.0.0", () => {
    log(`Server running on port ${PORT}`);
  });

  // 3. Register routes and start DB setup
  (async () => {
    try {
      console.log("Registering routes...");
      await registerRoutes(httpServer, app);
      console.log("Routes registered.");

      // Global error handler
      app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        console.error("Internal Server Error:", err);
        if (res.headersSent) return next(err);
        return res.status(status).json({ message });
      });

      // Static files and SPA catch-all
      if (process.env.NODE_ENV === "production") {
        const publicPath = path.resolve(__dirname, "public");
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

      // Background DB Schema Initialization (Does not block route registration)
      (async () => {
        try {
          console.log("Starting background database initialization...");
          await ensureMultiUnitColumns();
          await ensureProductPriceAuditsTable();
          await ensureSuspendedSalesTable();
          await ensureCashierShiftsTable();
          await ensureCashierShiftSnapshotColumns();
          await ensureSalesShiftIdColumn();
          await ensureSalesStatusColumns();
          await ensureReturnRefundMethodColumn();
          await ensureReturnsEnhancementsSchema();
          await ensureShiftReportsSchema();
          await ensureAuditLogsTable();
          await ensureAppSettingsTable();
          await ensureDiscountsSchema();
          await ensureEnterpriseInventorySchema();
          await ensureCustomerMembershipSchema();

          // Ensure default admin
          try {
            const initResult = await InitializationService.ensureDefaultAdmin();
            if (initResult.created) {
              console.log("✅ INITIALIZATION SUCCESS: Default admin created (admin / admin123)");
            } else {
              console.log("ℹ️ Initialization skipped: Users already exist.");
            }
          } catch (initErr) {
            console.error("❌ Failed to ensure default admin:", initErr);
          }
          console.log("Database initialization complete.");
        } catch (dbErr) {
          console.error("Database initialization error:", dbErr);
          console.log("⚠️ Application will continue, but database-dependent features may fail.");
        }
      })();

      console.log("Server setup complete.");
    } catch (err) {
      console.error("Startup background error:", err);
    }
  })();

})().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
