import { Router } from "express";

import { AppDataSource } from "../../database/datasource";
import { ScheduleSlot } from "../../database/entity/schedule-slots";
import { SlotStatus } from "../../database/entity/types";
import { MoreThan } from "typeorm";
import { scheduleSlotSchema } from "@chess-master/schemas";

export const router = Router();

// GET /schedule/finished-events - Get slots for a master
router.get("", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(ScheduleSlot);

    const events = await repo.find({
      where: {
        startTime: MoreThan(new Date()),
        status: SlotStatus.Free,
      },
      relations: { master: true },
      order: { startTime: "ASC" },
      ...(req.query.limit ? { take: Number(req.query.limit) } : {}),
    });
    res.json({
      succsess: true,
      events: events.map((event) => scheduleSlotSchema.parse(event)),
    });
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
