import { Router } from "express";
import {
  activeSlotsOutputSchema,
  getMasterSlotsResponseSchema,
} from "@chess-master/schemas";
import {
  getSlotsByMaster,
  getMasterActiveFreeSlots,
  formatMasterScheduleSlot,
} from "../../../services/schedule.service";
import { canViewUser, getUserById } from "../../../services/user.service";
import { User } from "../../../database/entity/user";
import { logRequestError } from "../../../utils/log-request-error";

export const router = Router();

function viewerId(req: { user?: unknown }): number | undefined {
  return req.user instanceof User ? req.user.id : undefined;
}

async function isHiddenFromViewer(userId: number, req: { user?: unknown }) {
  const user = await getUserById(userId);
  return !!user && !canViewUser(user, viewerId(req));
}

// GET /schedule/slot/user/:userId/active — future free slots for a master
router.get("/user/:userId/active", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    if (await isHiddenFromViewer(userId, req)) {
      return res.status(404).json({ error: "User not found" });
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
    logRequestError(req, err, "Error fetching active slots");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /schedule/slot/user/:userId - Get slots for a master
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (await isHiddenFromViewer(userId, req)) {
      return res.status(404).json({ error: "User not found" });
    }
    const slots = await getSlotsByMaster(userId);
    const payload = getMasterSlotsResponseSchema.parse({
      success: true,
      slots: slots.map(formatMasterScheduleSlot),
    });

    res.json(payload);
  } catch (err) {
    logRequestError(req, err, "Error fetching user slots");
    res.status(500).json({ error: "Internal server error" });
  }
});
