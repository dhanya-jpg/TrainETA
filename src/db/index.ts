import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema.js';

const { Pool } = pkg;

// Only initialize the pool if DATABASE_URL or SQL_HOST is available
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let pool: pkg.Pool | null = null;

export function getDb() {
  if (!db) {
    if (process.env.DATABASE_URL) {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });
    } else if (process.env.SQL_HOST) {
      pool = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
      });
    } else {
      throw new Error('Database connection variables are missing.');
    }
    db = drizzle(pool, { schema });
  }
  return db;
}
