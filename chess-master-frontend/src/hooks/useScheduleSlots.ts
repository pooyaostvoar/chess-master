import { useEffect, useState } from "react";
import { getSlotsByMaster, getMasterActiveSlots } from "../services/schedule";
import { mapSlotToEvent } from "../utils/slotUtils";

interface UseScheduleSlotsOptions {
  showBookingHint?: boolean;
  isMasterView?: boolean;
  /** Use GET .../user/:id/active (future free slots only) */
  activeOnly?: boolean;
}

export const useScheduleSlots = (
  userId: string | undefined,
  options?: UseScheduleSlotsOptions
) => {
  console.log("useScheduleSlots", userId);
  const [events, setEvents] = useState<any[]>([]);
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadSlots = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = options?.activeOnly
        ? await getMasterActiveSlots(Number(userId))
        : await getSlotsByMaster(Number(userId));

      const slots = res.slots || [];
      setRawEvents(slots);
      setEvents(
        slots.map((slot) =>
          mapSlotToEvent(slot, {
            showBookingHint: options?.showBookingHint,
            isMasterView: options?.isMasterView,
          })
        )
      );
      setError(null);
    } catch (err) {
      console.error("Failed to load slots", err);
      setError("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadSlots();
  }, [userId, options?.showBookingHint, options?.activeOnly]);

  const refreshSlots = async () => {
    if (!userId) return;

    try {
      const res = options?.activeOnly
        ? await getMasterActiveSlots(Number(userId))
        : await getSlotsByMaster(Number(userId));
      const slots = res.slots || [];
      setRawEvents(slots);
      setEvents(
        slots.map((slot) =>
          mapSlotToEvent(slot, {
            showBookingHint: options?.showBookingHint,
            isMasterView: options?.isMasterView,
          })
        )
      );
    } catch (err) {
      console.error("Failed to refresh slots", err);
    }
  };

  return { events, loading, error, refreshSlots, setEvents, rawEvents };
};
