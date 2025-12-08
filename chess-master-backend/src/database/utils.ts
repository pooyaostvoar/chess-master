import { Client } from "pg";

export async function ensureTestDatabase(databaseName: string) {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "chessuser",
    password: process.env.DB_PASSWORD || "chesspass",
    database: "postgres",
  });

  await client.connect();
  await client.query(`CREATE DATABASE ${databaseName}`);
  await client.end();
}

export async function dropTestDatabase(databaseName: string) {
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "chessuser",
    password: process.env.DB_PASSWORD || "chesspass",
    database: "postgres",
  });

  await client.connect();
  await client.query(`DROP DATABASE ${databaseName}`);
  await client.end();
}
