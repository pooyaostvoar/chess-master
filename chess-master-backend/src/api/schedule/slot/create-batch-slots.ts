import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { AppDataSource } from "../../../database/datasource";
import { ScheduleSlot } from "../../../database/entity/schedule-slots";
import { User } from "../../../database/entity/user";
import { createBatchSlotsInputSchema, Period } from "@chess-master/schemas";

export const router = Router();

function shiftDate(base: Date, period: Period, iteration: number): Date {
  const shifted = new Date(base);

  if (period === Period.Daily) {
    shifted.setDate(shifted.getDate() + iteration);
    return shifted;
  }

  if (period === Period.Weekly) {
    shifted.setDate(shifted.getDate() + iteration * 7);
    return shifted;
  }

  shifted.setMonth(shifted.getMonth() + iteration);
  return shifted;
}

// POST /schedule/slot/create-batch-slots - Create slots in bulk
router.post("/create-batch-slots", isAuthenticated, async (req, res) => {
  try {
    const parsedBody = createBatchSlotsInputSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsedBody.error.flatten(),
      });
    }
    const { interval, chunkSizeMinutes, repeatCount, period } = parsedBody.data;
    const baseStart = interval.start;
    const baseEnd = interval.end;

    const masterId = Number((req.user as any)?.id);

    const chunkSizeMs = chunkSizeMinutes * 60 * 1000;
    const slotInsertRows: Array<{
      master: User;
      startTime: Date;
      endTime: Date;
    }> = [];

    for (let i = 0; i < repeatCount; i += 1) {
      const shiftedStart = shiftDate(baseStart, period, i);
      const shiftedEnd = shiftDate(baseEnd, period, i);

      let chunkStartMs = shiftedStart.getTime();
      const shiftedEndMs = shiftedEnd.getTime();

      while (chunkStartMs < shiftedEndMs) {
        const chunkEndMs = Math.min(chunkStartMs + chunkSizeMs, shiftedEndMs);

        slotInsertRows.push({
          master: { id: masterId } as User,
          startTime: new Date(chunkStartMs),
          endTime: new Date(chunkEndMs),
        });

        chunkStartMs = chunkEndMs;
      }
    }

    const repo = AppDataSource.getRepository(ScheduleSlot);
    const insertResult = await repo
      .createQueryBuilder()
      .insert()
      .into(ScheduleSlot)
      .values(slotInsertRows)
      .returning("*")
      .execute();

    return res.json({
      success: true,
      createdSlots: insertResult.raw.length,
      slots: insertResult.raw,
    });
  } catch (err) {
    console.error("Error creating batch slots:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
