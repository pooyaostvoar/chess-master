import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { reserveSlot, formatSlot } from "../../../services/schedule.service";

export const router = Router();

// POST /schedule/slot/:id/reserve - Reserve a slot
router.post("/:id/reserve", isAuthenticated, async (req, res) => {
  try {
    const slotId = Number(req.params.id);
    const userId = (req.user as any)?.id;

    const slot = await reserveSlot(slotId, userId);
    res.json({ message: "Slot requested", slot: formatSlot(slot) });
  } catch (err: any) {
    if (
      err.message === "Slot not found" ||
      err.message === "Slot not found after reservation"
    ) {
      return res.status(404).json({ error: "Slot not found" });
    }
    if (
      err.message === "Slot is not available" ||
      err.message === "Cannot book time slots in the past"
    ) {
      return res.status(400).json({ error: err.message });
    }
    console.error("Error reserving slot:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

