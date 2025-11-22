import fsExtra from "fs-extra";
import { AppDataSource } from "../database/datasource";

beforeEach(async () => {
  await AppDataSource.initialize();
});
afterEach(async () => {
  await AppDataSource.destroy();
});
