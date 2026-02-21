import { Router } from "express";
import { getSlotsByMaster, formatSlot } from "../../services/schedule.service";
import { AppDataSource } from "../../database/datasource";
import { ScheduleSlot } from "../../database/entity/schedule-slots";
import { SlotStatus } from "../../database/entity/types";
import { IsNull, LessThan, Not } from "typeorm";
import { scheduleSlotSchema } from "@chess-master/schemas";

export const router = Router();

// GET /schedule/finished-events - Get slots for a master
router.get("", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(ScheduleSlot);

    const events = await repo.find({
      where: {
        youtubeId: Not(IsNull()),
      },
      relations: { master: true },
      order: { endTime: "DESC" },
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
