import { DataSource } from "typeorm";
import { User } from "./entity/user";
import { Game } from "./entity/game";
import { ScheduleSlot } from "./entity/schedule-slots";
import { MasterPricing } from "./entity/master-pricing";
import { readSecret } from "../utils/secret";

export const AppDataSource = new DataSource(
  process.env.NODE_ENV === "test"
    ? {
        name: "default",
        type: "better-sqlite3",
        database: ":memory:",
        entities: [User, Game, ScheduleSlot, MasterPricing],
        synchronize: true,
        dropSchema: true,
      }
    : {
        type: "postgres",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        username: readSecret("/run/secrets/postgres_user") || "chessuser",
        password: readSecret("/run/secrets/postgres_password") || "chesspass",
        database: "chess_master",
        synchronize: true,
        entities: [User, Game, ScheduleSlot, MasterPricing],
      }
);
