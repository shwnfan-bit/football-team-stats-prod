import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

let db: any = null;

export async function getDb() {
  if (db) return db;

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
  }

  // 支持 mysql://user:pass@host:port/db 格式的连接字符串
  const connection = await mysql.createConnection(connectionString);
  db = drizzle(connection, { schema, mode: 'default' });
  
  // 生产环境下可以考虑在这里运行简单的迁移逻辑，或者手动在数据库执行建表语句
  console.log("MySQL Database connected");
  
  return db;
}
