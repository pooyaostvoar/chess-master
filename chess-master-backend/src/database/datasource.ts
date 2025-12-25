import { DataSource, DataSourceOptions } from "typeorm";
import { User } from "./entity/user";
import { AdminUser } from "./entity/admin-user";
import { Game } from "./entity/game";
import { ScheduleSlot } from "./entity/schedule-slots";
import { readSecret } from "../utils/secret";
import { ensureTestDatabase } from "./utils";
import { Message } from "./entity/message";
import { PushSubscription } from "./entity/push-subscription";

const defaultConfig: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username:
    process.env.DB_USER ||
    readSecret("/run/secrets/postgres_user") ||
    "chessuser",
  password:
    process.env.DB_PASSWORD ||
    readSecret("/run/secrets/postgres_password") ||
    "chesspass",
  database: process.env.DB_NAME || "chess_master",
  migrations:
    process.env.ENV === "production"
      ? ["chess-master-backend/dist/database/migrations/**/*.js"]
      : ["src/database/migrations/**/*.ts"],
  entities: [User, AdminUser, Game, ScheduleSlot, Message, PushSubscription],
};

export let AppDataSource = new DataSource(defaultConfig);

export async function changeDB(dbName: string) {
  await ensureTestDatabase(dbName);
  AppDataSource = new DataSource({
    ...defaultConfig,
    database: dbName,
    dropSchema: process.env.NODE_ENV === "test",
  } as DataSourceOptions);
}
