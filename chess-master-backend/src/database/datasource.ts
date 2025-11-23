import { DataSource } from "typeorm";
import { User } from "./entity/user";
import { Game } from "./entity/game";
import { ScheduleSlot } from "./entity/schedule-slots";

export const AppDataSource = new DataSource(
  process.env.NODE_ENV === "test"
    ? {
        name: "default",
        type: "better-sqlite3",
        database: ":memory:",
        entities: [User, Game, ScheduleSlot],
        synchronize: true,
        dropSchema: true,
      }
    : {
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "chessuser",
        password: "chesspass",
        database: "chess_master",
        synchronize: true,
        entities: [User, Game, ScheduleSlot],
      }
);
