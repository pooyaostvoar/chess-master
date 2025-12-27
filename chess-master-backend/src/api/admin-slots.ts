import express from "express";
import { AppDataSource } from "../database/datasource";
import { ScheduleSlot } from "../database/entity/schedule-slots";
import { isAdmin } from "../middleware/passport";
import { SlotStatus } from "../database/entity/types";

export const adminSlotsRouter = express.Router();

adminSlotsRouter.use(isAdmin);

adminSlotsRouter.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt((req.query.pageSize as string) || "20", 10), 1),
      100
    );

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const userId = req.query.userId as string;
    const status = req.query.status as string;

    const repo = AppDataSource.getRepository(ScheduleSlot);
    const qb = repo
      .createQueryBuilder("slot")
      .leftJoinAndSelect("slot.master", "master")
      .leftJoinAndSelect("slot.reservedBy", "reservedBy");

    // Filter by start date (slots that start after or on this date)
    if (startDate) {
      qb.andWhere("slot.startTime >= :startDate", { startDate });
    }

    // Filter by end date (slots that end before or on this date)
    if (endDate) {
      qb.andWhere("slot.endTime <= :endDate", { endDate });
    }

    // Filter by master user ID
    if (userId) {
      qb.andWhere("slot.reservedBy.id = :userId", {
        userId: parseInt(userId, 10),
      });
    }

    // Filter by status
    if (status && Object.values(SlotStatus).includes(status as SlotStatus)) {
      qb.andWhere("slot.status = :status", { status });
    }

    // Order by start time (most recent first)
    qb.orderBy("slot.startTime", "DESC");

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    res.json({
      items,
      total,
      page,
      pageSize,
    });
  } catch (err) {
    next(err);
  }
});
