import TestAgent from "supertest/lib/agent";
import { createApp } from "../src/app";
import { AppDataSource, changeDB } from "../src/database/datasource";
import request from "supertest";
import { dropTestDatabase } from "../src/database/utils";

export let app: any;
export let unauthAgent: TestAgent;
export let authAgent: TestAgent;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.REDIS_URL = "redis://:redis-pass@localhost:6378";
  app = createApp();
});

let dbName = "";
beforeEach(async () => {
  dbName = `chess_master_test_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  await changeDB(dbName);

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await AppDataSource.runMigrations();

  unauthAgent = request(app);
  authAgent = request.agent(app);

  await authAgent
    .post("/signup")
    .send({ username: "seeduser", password: "mypassword" })
    .expect(200);

  await authAgent
    .post("/login")
    .send({ username: "seeduser", password: "mypassword" })
    .expect(200);
});

afterEach(async () => {
  try {
    if (authAgent) await authAgent.post("/logout");
  } catch (_) {}
  try {
    if (AppDataSource?.isInitialized) await AppDataSource.destroy();
  } catch (_) {}
  try {
    if (dbName) await dropTestDatabase(dbName);
  } catch (_) {}
});
