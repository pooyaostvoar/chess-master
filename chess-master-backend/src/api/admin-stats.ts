import express from "express";
import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";
import { ScheduleSlot } from "../database/entity/schedule-slots";
import { Game } from "../database/entity/game";
import { isAdmin } from "../middleware/passport";
import { SlotStatus } from "../database/entity/types";

export const adminStatsRouter = express.Router();

adminStatsRouter.use(isAdmin);

adminStatsRouter.get("/", async (_req, res, next) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const gameRepo = AppDataSource.getRepository(Game);

    const now = new Date();

    const [
      totalUsers,
      totalMasters,
      upcomingSlots,
      bookedSlots,
      totalGames,
      masters,
    ] = await Promise.all([
      userRepo.count(),
      userRepo.count({ where: { isMaster: true } }),
      slotRepo
        .createQueryBuilder("slot")
        .where("slot.startTime > :now", { now })
        .getCount(),
      slotRepo
        .createQueryBuilder("slot")
        .where("slot.status IN (:...statuses)", {
          statuses: [SlotStatus.Booked, SlotStatus.Reserved],
        })
        .getCount(),
      gameRepo.count(),
      userRepo
        .createQueryBuilder("user")
        .where("user.isMaster = true")
        .orderBy("user.rating", "DESC", "NULLS LAST")
        .addOrderBy("user.id", "DESC")
        .limit(5)
        .getMany(),
    ]);

    res.json({
      totalUsers,
      totalMasters,
      upcomingSlots,
      bookedSlots,
      totalGames,
      masters: masters.map((m) => ({
        id: m.id,
        username: m.username,
        title: m.title,
        rating: m.rating,
      })),
      asOf: now.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
