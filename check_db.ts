
import { mysqlTable, int, varchar, decimal, boolean, datetime, text } from "drizzle-orm/mysql-core";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

async function checkDb() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  const [rows] = await connection.execute("DESCRIBE products");
  console.log("Columns in 'products' table:");
  console.log(rows);
  await connection.end();
}

checkDb().catch(console.error);
