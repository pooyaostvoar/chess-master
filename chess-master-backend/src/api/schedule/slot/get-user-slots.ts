import { Router } from "express";
import {
  activeSlotsOutputSchema,
  getMasterSlotsResponseSchema,
} from "@chess-master/schemas";
import {
  getSlotsByMaster,
  getMasterActiveFreeSlots,
  formatSlot,
  formatMasterScheduleSlot,
} from "../../../services/schedule.service";

export const router = Router();

// GET /schedule/slot/user/:userId/active — future free slots for a master
router.get("/user/:userId/active", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }

    const slots = await getMasterActiveFreeSlots(userId);
    const payload = activeSlotsOutputSchema.parse({
      success: true,
      slots: slots.map((slot) => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
        title: slot.title,
        price: slot.price != null ? Number(slot.price) : null,
      })),
    });

    res.json(payload);
  } catch (err) {
    console.error("Error fetching active slots:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /schedule/slot/user/:userId - Get slots for a master
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const slots = await getSlotsByMaster(userId);
    const payload = getMasterSlotsResponseSchema.parse({
      success: true,
      slots: slots.map(formatMasterScheduleSlot),
    });

    res.json(payload);
  } catch (err) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
