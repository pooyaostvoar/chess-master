import { Router } from "express";
import {
  getSlotsByMaster,
  formatSlot,
} from "../../../services/schedule.service";

export const router = Router();

// GET /schedule/slot/user/:userId - Get slots for a master
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const slots = await getSlotsByMaster(userId);
    const formattedSlots = slots.map(formatSlot);

    res.json({ success: true, slots: formattedSlots });
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
