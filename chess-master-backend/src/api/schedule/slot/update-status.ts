import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { SlotStatus } from "../../../database/entity/types";
import { updateSlotStatus, formatSlot } from "../../../services/schedule.service";
import { geoblockPaymentMiddleware } from "../../../utils/geoblock";

export const router = Router();

// PATCH /schedule/slot/:id/status - Update slot status
router.patch("/:id/status", isAuthenticated, geoblockPaymentMiddleware, async (req, res) => {
  try {
    const slotId = Number(req.params.id);
    const masterId = (req.user as any).id;
    const { status } = req.body;

    const slot = await updateSlotStatus(slotId, masterId, status as SlotStatus);
    res.json({ message: "Slot status updated", slot: formatSlot(slot) });
  } catch (err: any) {
    if (
      err.message === "Slot not found or you are not the master" ||
      err.message === "Slot not found after update"
    ) {
      return res
        .status(404)
        .json({ error: "Slot not found or you are not the master" });
    }
    console.error("Error updating slot status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

