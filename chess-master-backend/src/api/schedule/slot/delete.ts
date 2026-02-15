import { Router } from "express";
import { isAuthenticated } from "../../../middleware/passport";
import { deleteSlots } from "../../../services/schedule.service";
import { geoblockPaymentMiddleware } from "../../../utils/geoblock";

export const router = Router();

// DELETE /schedule/slot - Delete slots
router.delete("", isAuthenticated, geoblockPaymentMiddleware, async (req, res) => {
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

