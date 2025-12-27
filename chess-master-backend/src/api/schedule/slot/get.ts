import { Router } from "express";
import { getSlotById } from "../../../services/schedule.service";

export const router = Router();

/**
 * GET /schedule/slot/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const slotId = Number(req.params.id);

    if (isNaN(slotId)) {
      return res.status(400).json({ message: "Invalid slot id" });
    }

    const slot = await getSlotById(slotId);

    res.json(slot);
  } catch (error: any) {
    res.status(404).json({
      message: error.message || "Slot not found",
    });
  }
});
