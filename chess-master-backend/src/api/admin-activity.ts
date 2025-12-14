import express from "express";
import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";
import { ScheduleSlot } from "../database/entity/schedule-slots";
import { Game } from "../database/entity/game";
import { isAdmin } from "../middleware/passport";
import { SlotStatus } from "../database/entity/types";

export const adminActivityRouter = express.Router();

adminActivityRouter.use(isAdmin);

adminActivityRouter.get("/", async (_req, res, next) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const gameRepo = AppDataSource.getRepository(Game);

    const [signups, bookings, games] = await Promise.all([
      userRepo
        .createQueryBuilder("user")
        .orderBy("user.id", "DESC")
        .limit(5)
        .getMany(),
      slotRepo
        .createQueryBuilder("slot")
        .leftJoinAndSelect("slot.master", "master")
        .leftJoinAndSelect("slot.reservedBy", "reservedBy")
        .where("slot.status IN (:...statuses)", {
          statuses: [SlotStatus.Booked, SlotStatus.Reserved],
        })
        .orderBy("slot.startTime", "DESC")
        .limit(5)
        .getMany(),
      gameRepo
        .createQueryBuilder("game")
        .orderBy("game.createdAt", "DESC")
        .limit(5)
        .getMany(),
    ]);

    res.json({
      signups: signups.map((u) => ({
        id: u.id,
        username: u.username,
        isMaster: u.isMaster,
        createdAt: u.createdAt,
      })),
      bookings: bookings.map((b) => ({
        id: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        master: b.master ? { id: b.master.id, username: b.master.username } : null,
        reservedBy: b.reservedBy ? { id: b.reservedBy.id, username: b.reservedBy.username } : null,
        createdAt: b.startTime,
      })),
      cancellations: [],
      games: games.map((g) => ({
        id: g.id,
        createdAt: g.createdAt,
        finished: g.finished,
      })),
    });
  } catch (err) {
    next(err);
  }
});
