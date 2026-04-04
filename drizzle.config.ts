import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "mysql://root:AKJNEklOKTfUpRHSdAzXzGXzgZHHyoAO@mysql.railway.internal:3306/railway",
  },
});
