import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }>
{
  return pool.query<T>(text, params);
}

export async function getClient() {
  return pool.connect();
}
