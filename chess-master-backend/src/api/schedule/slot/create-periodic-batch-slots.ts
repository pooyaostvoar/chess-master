import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { AppDataSource } from "../../../database/datasource";
import { ScheduleSlot } from "../../../database/entity/schedule-slots";
import { PeriodicSlotConfig } from "../../../database/entity/periodic-slot-config";
import { User } from "../../../database/entity/user";
import { createPeriodicBatchSlotsInputSchema, Period } from "@chess-master/schemas";

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

// POST /schedule/slot/create-periodic-batch-slots - Create slots in bulk
router.post("/create-periodic-batch-slots", isAuthenticated, async (req, res) => {
  try {
    const parsedBody = createPeriodicBatchSlotsInputSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsedBody.error.flatten(),
      });
    }
    const {
      interval,
      chunkSizeMinutes,
      repeatCount,
      period,
      title,
      description,
      price,
      youtubeId,
    } = parsedBody.data;
    const baseStart = interval.start;
    const baseEnd = interval.end;

    const masterId = Number((req.user as any)?.id);

    const chunkSizeMs = chunkSizeMinutes * 60 * 1000;

    const result = await AppDataSource.manager.transaction(async (trx) => {
      const configRepo = trx.getRepository(PeriodicSlotConfig);
      const slotRepo = trx.getRepository(ScheduleSlot);

      const config = await configRepo.save({
        chunkSizeMinutes,
        period,
        repeatCount,
        user: { id: masterId } as User,
      });

      const slotInsertRows: Array<{
        master: User;
        periodicSlotConfig: PeriodicSlotConfig;
        chunkIndex: number;
        startTime: Date;
        endTime: Date;
        title: string | null;
        description: string | null;
        price: number | null;
        youtubeId: string | null;
      }> = [];

      for (let i = 0; i < repeatCount; i += 1) {
        // Within each repeated interval, chunks are 0..n-1 (resets every repeat)
        let chunkIndex = 0;
        const shiftedStart = shiftDate(baseStart, period, i);
        const shiftedEnd = shiftDate(baseEnd, period, i);

        let chunkStartMs = shiftedStart.getTime();
        const shiftedEndMs = shiftedEnd.getTime();

        while (chunkStartMs < shiftedEndMs) {
          const chunkEndMs = Math.min(chunkStartMs + chunkSizeMs, shiftedEndMs);

          slotInsertRows.push({
            master: { id: masterId } as User,
            periodicSlotConfig: config,
            chunkIndex: chunkIndex++,
            startTime: new Date(chunkStartMs),
            endTime: new Date(chunkEndMs),
            title: title ?? null,
            description: description ?? null,
            price: price ?? null,
            youtubeId: youtubeId ?? null,
          });

          chunkStartMs = chunkEndMs;
        }
      }

      const insertResult = await slotRepo
        .createQueryBuilder()
        .insert()
        .into(ScheduleSlot)
        .values(slotInsertRows)
        .returning("*")
        .execute();

      return { config, insertResult };
    });

    return res.json({
      success: true,
      createdSlots: result.insertResult.raw.length,
      slots: result.insertResult.raw,
      periodicSlotConfig: {
        id: result.config.id,
        chunkSizeMinutes: result.config.chunkSizeMinutes,
        period: result.config.period,
        repeatCount: result.config.repeatCount,
      },
    });
  } catch (err) {
    console.error("Error creating periodic batch slots:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
