/** Calendar background/border color for a slot status (same as mapSlotToEvent). */
export function slotStatusCalendarColor(status: string | undefined): string {
  switch (status) {
    case "free":
      return "#27ae60";
    case "reserved":
      return "#f39c12";
    case "paid":
      return "#6AADDE";
    case "booked":
      return "#e74c3c";
    default:
      return "#777";
  }
}

/** Slot belongs to a periodic config chunk (same grouping as batch delete/update). */
export function slotIsPeriodicSeriesChunk(slot: unknown): boolean {
  if (!slot || typeof slot !== "object") return false;
  const s = slot as Record<string, unknown>;
  return s.periodicSlotConfig != null && s.chunkIndex != null;
}

/**
 * Maps slot status to calendar event format
 */
export const mapSlotToEvent = (
  slot: any,
  options?: { showBookingHint?: boolean; isMasterView?: boolean }
) => {
  let title = "Unknown";
  const color = slotStatusCalendarColor(slot.status);

  switch (slot.status) {
    case "free":
      title =
        (slot.title || "Available") + (slot.price ? ` - $${slot.price}` : "");
      break;

    case "reserved":
      // Show request info for masters, regular "Reserved" for others
      if (options?.isMasterView && slot.reservedBy) {
        title = `Request from ${slot.reservedBy.username || "User"}`;
      } else {
        title = "Reserved";
      }
      break;

    case "paid":
      // Show request info for masters, regular "Reserved" for others
      if (options?.isMasterView && slot.reservedBy) {
        title = `Pending: ${slot.reservedBy.username || "User"}`;
      } else {
        title = "Payment Received";
      }
      break;

    case "booked":
      title = "Booked";
      break;
  }

  return {
    id: slot.id,
    title,
    start: slot.startTime,
    end: slot.endTime,
    backgroundColor: color,
    borderColor: color,
    textColor: "#fff",
    extendedProps: {
      fullSlot: slot, // Store full slot data for modal
    },
  };
};
