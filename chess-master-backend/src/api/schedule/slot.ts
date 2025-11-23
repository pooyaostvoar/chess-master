import { Router } from "express";
import { isAuthenticated } from "../../middleware/passport";
import { SlotStatus } from "../../database/entity/types";
import {
  createSlot,
  getSlotsByMaster,
  deleteSlots,
  reserveSlot,
  updateSlotStatus,
  getUserBookings,
  getMasterBookings,
  formatSlot,
} from "../../services/schedule.service";

export const slotRouter = Router();

// POST /schedule/slot - Create a new slot
slotRouter.post("", isAuthenticated, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const masterId = (req.user as any)?.id;

    const slot = await createSlot({
      masterId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    res.json({ success: true, slot });
  } catch (err) {
    console.error("Error creating slot:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /schedule/slot/user/:userId - Get slots for a master
slotRouter.get("/user/:userId", async (req, res) => {
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

// DELETE /schedule/slot - Delete slots
slotRouter.delete("/", isAuthenticated, async (req, res) => {
  try {
    const ids: number[] = req.body.ids;
    const userId = (req.user as any)?.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ error: "ids must be a non-empty array" });
    }

    const deletedIds = await deleteSlots(ids, userId);

    return res.json({
      success: true,
      deletedIds,
    });
  } catch (err: any) {
    if (err.message === "No valid slots found") {
      return res.status(404).json({ error: err.message });
    }
    console.error("Error deleting slots:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /schedule/slot/:id/reserve - Reserve a slot
slotRouter.post("/:id/reserve", isAuthenticated, async (req, res) => {
  try {
    const slotId = Number(req.params.id);
    const userId = (req.user as any)?.id;

    const slot = await reserveSlot(slotId, userId);
    res.json({ message: "Slot requested", slot: formatSlot(slot) });
  } catch (err: any) {
    if (err.message === "Slot not found" || err.message === "Slot not found after reservation") {
      return res.status(404).json({ error: "Slot not found" });
    }
    if (err.message === "Slot is not available") {
      return res.status(400).json({ error: err.message });
    }
    console.error("Error reserving slot:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /schedule/slot/:id/status - Update slot status
slotRouter.patch("/:id/status", isAuthenticated, async (req, res) => {
  try {
    const slotId = Number(req.params.id);
    const masterId = (req.user as any).id;
    const { status } = req.body;

    const slot = await updateSlotStatus(slotId, masterId, status as SlotStatus);
    res.json({ message: "Slot status updated", slot: formatSlot(slot) });
  } catch (err: any) {
    if (err.message === "Slot not found or you are not the master" || err.message === "Slot not found after update") {
      return res.status(404).json({ error: "Slot not found or you are not the master" });
    }
    console.error("Error updating slot status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /schedule/slot/my-bookings - Get bookings for regular users
slotRouter.get("/my-bookings", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const slots = await getUserBookings(userId);
    const formattedSlots = slots.map(formatSlot);

    res.json({ success: true, bookings: formattedSlots });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /schedule/slot/master-bookings - Get bookings for masters
slotRouter.get("/master-bookings", isAuthenticated, async (req, res) => {
  try {
    const masterId = (req.user as any)?.id;
    const slots = await getMasterBookings(masterId);
    const formattedSlots = slots.map(formatSlot);

    res.json({ success: true, bookings: formattedSlots });
  } catch (err) {
    console.error("Error fetching master bookings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
