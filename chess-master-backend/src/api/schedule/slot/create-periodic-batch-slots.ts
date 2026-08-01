import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { createPeriodicBatchSlotsInputSchema } from "@chess-master/schemas";
import { createPeriodicBatchSlots } from "../../../services/schedule.service";
import { logRequestError } from "../../../utils/log-request-error";

export const router = Router();

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

    const masterId = Number((req.user as any)?.id);
    const result = await createPeriodicBatchSlots(masterId, parsedBody.data);

    return res.json({
      success: true,
      createdSlots: result.slots.length,
      slots: result.slots,
      periodicSlotConfig: {
        id: result.config.id,
        chunkSizeMinutes: result.config.chunkSizeMinutes,
        period: result.config.period,
        repeatCount: result.config.repeatCount,
      },
    });
  } catch (err) {
    logRequestError(req, err, "Error creating periodic batch slots");
    return res.status(500).json({ error: "Internal server error" });
  }
});
