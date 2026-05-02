import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import {
  formatUpdatePeriodicBatchSlotResponse,
  updatePeriodicBatchSlotsBySharedChunk,
} from "../../../services/schedule.service";
import {
  updatePeriodicBatchSlotInputSchema,
  updatePeriodicBatchSlotResponseSchema,
} from "@chess-master/schemas";

export const router = Router();

// POST /schedule/slot/update-periodic-batch-slots
router.post(
  "/update-periodic-batch-slots",
  isAuthenticated,
  async (req, res) => {
    try {
      const parsed = updatePeriodicBatchSlotInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid request body",
          details: parsed.error.flatten(),
        });
      }

      const masterId = Number((req.user as any)?.id);
      const { slotId, ...patch } = parsed.data;
      const slots = await updatePeriodicBatchSlotsBySharedChunk(
        slotId,
        masterId,
        patch
      );

      const payload = updatePeriodicBatchSlotResponseSchema.parse({
        success: true,
        updatedCount: slots.length,
        slots: slots.map(formatUpdatePeriodicBatchSlotResponse),
      });

      return res.json(payload);
    } catch (err: any) {
      if (err.message === "Slot not found or you are not the master") {
        return res.status(404).json({ error: err.message });
      }
      if (
        typeof err.message === "string" &&
        err.message.startsWith("Cannot ")
      ) {
        return res.status(400).json({ error: err.message });
      }
      console.error("Error in update-periodic-batch-slots:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
