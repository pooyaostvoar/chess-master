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
  dbName = `chess_master_test_${Date.now()}`;
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
  await authAgent.post("/logout");
  await AppDataSource.destroy();
  await dropTestDatabase(dbName);
});
