import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { updateSlot, formatSlot } from "../../../services/schedule.service";

export const router = Router();

// PATCH /schedule/slot/:id - Update slot times
router.patch("/:id", isAuthenticated, async (req, res) => {
  try {
    const slotId = Number(req.params.id);
    const masterId = (req.user as any).id;

    const slot = await updateSlot(slotId, masterId, req.body);
    res.json({ message: "Slot updated", slot: formatSlot(slot) });
  } catch (err: any) {
    if (
      err.message === "Slot not found or you are not the master" ||
      err.message === "Slot not found after update"
    ) {
      return res.status(400).json({ error: err.message });
    }
    console.error("Error updating slot:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
