import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { getMasterBookings, formatSlot } from "../../../services/schedule.service";
import { logRequestError } from "../../../utils/log-request-error";

export const router = Router();

// GET /schedule/slot/master-bookings - Get bookings for masters
router.get("/master-bookings", isAuthenticated, async (req, res) => {
  try {
    const masterId = (req.user as any)?.id;
    const slots = await getMasterBookings(masterId);
    const formattedSlots = slots.map(formatSlot);

    res.json({ success: true, bookings: formattedSlots });
  } catch (err) {
    logRequestError(req, err, "Error fetching master bookings");
    res.status(500).json({ error: "Internal server error" });
  }
});

