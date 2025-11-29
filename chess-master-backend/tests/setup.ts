import { createApp } from "../src/app";
import { AppDataSource, changeDB } from "../src/database/datasource";

export const app = createApp();
beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await changeDB("chess_master_test");
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
});

afterEach(async () => {
  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    const repo = AppDataSource.getRepository(entity.name);
    await repo.query(`TRUNCATE "${entity.tableName}" RESTART IDENTITY CASCADE`);
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) await AppDataSource.destroy();
});
