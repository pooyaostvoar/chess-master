import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { createSlot } from "../../../services/schedule.service";

export const router = Router();

// POST /schedule/slot - Create a new slot
router.post("", isAuthenticated, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const masterId = (req.user as any)?.id;

    const slot = await createSlot({
      masterId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    res.json({ success: true, slot });
  } catch (err: any) {
    if (err.message === "Cannot create time slots in the past") {
      return res.status(400).json({ error: err.message });
    }
    console.error("Error creating slot:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

