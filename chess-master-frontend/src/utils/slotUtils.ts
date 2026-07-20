/** Calendar background/border color for a slot status (same as mapSlotToEvent). */
export function slotStatusCalendarColor(status: string | undefined): string {
  switch (status) {
    case "free":
      return "#6B8F5E";
    case "reserved":
      return "#B8893D";
    case "paid":
      return "#8B6F4E";
    case "booked":
      return "#7A2E2E";
    default:
      return "#9C8366";
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
    textColor: slot.status === "reserved" ? "#1F1109" : "#fff",
    extendedProps: {
      fullSlot: slot, // Store full slot data for modal
    },
  };
};
