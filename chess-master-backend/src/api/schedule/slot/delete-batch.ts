import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { geoblockPaymentMiddleware } from "../../../utils/geoblock";
import { deleteBatchSlotsBySharedChunk } from "../../../services/schedule.service";
import {
  deleteBatchSlotInputSchema,
  deleteBatchSlotResponseSchema,
} from "@chess-master/schemas";

export const router = Router();

// POST /schedule/slot/delete-batch
router.post("/delete-batch", isAuthenticated, async (req, res) => {
  try {
    const parsed = deleteBatchSlotInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: parsed.error.flatten(),
      });
    }

    const masterId = Number((req.user as any)?.id);
    const deletedIds = await deleteBatchSlotsBySharedChunk(
      parsed.data.slotId,
      masterId
    );

    const payload = deleteBatchSlotResponseSchema.parse({
      success: true,
      deletedIds,
      deletedCount: deletedIds.length,
    });

    return res.json(payload);
  } catch (err: any) {
    if (err.message === "Slot not found or you are not the master") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error in delete-batch:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
