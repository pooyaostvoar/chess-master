import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { getUserBookings, formatSlot } from "../../../services/schedule.service";
import { logRequestError } from "../../../utils/log-request-error";

export const router = Router();

// GET /schedule/slot/my-bookings - Get bookings for regular users
router.get("/my-bookings", isAuthenticated, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const slots = await getUserBookings(userId);
    const formattedSlots = slots.map(formatSlot);

    res.json({ success: true, bookings: formattedSlots });
  } catch (err) {
    logRequestError(req, err, "Error fetching user bookings");
    res.status(500).json({ error: "Internal server error" });
  }
});

