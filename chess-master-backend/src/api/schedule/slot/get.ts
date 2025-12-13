import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { getSlotById } from "../../../services/schedule.service";

export const router = Router();

/**
 * GET /schedule/slot/:id
 */
router.get("/:id", isAuthenticated, async (req, res) => {
  console.log("GET /schedule/slot/:id called");
  try {
    const slotId = Number(req.params.id);

    if (isNaN(slotId)) {
      return res.status(400).json({ message: "Invalid slot id" });
    }

    const slot = await getSlotById(slotId);

    if (slot?.master.id !== (req.user as any).id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(slot);
  } catch (error: any) {
    res.status(404).json({
      message: error.message || "Slot not found",
    });
  }
});
