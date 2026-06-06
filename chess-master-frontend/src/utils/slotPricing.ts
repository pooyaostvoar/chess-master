export function slotLengthHours(
  startIso: string | Date,
  endIso: string | Date
): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, (end.getTime() - start.getTime()) / 3_600_000);
}

export function roundSlotPrice(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

/** Suggested per-slot price from hourly rate; uses chunk length when provided, else interval length. */
export function suggestedSlotPrice(
  hourlyRate: number | null | undefined,
  intervalStart: string | Date,
  intervalEnd: string | Date,
  chunkSizeMinutes?: number | null
): number {
  const hr = hourlyRate ?? 0;
  if (chunkSizeMinutes != null && chunkSizeMinutes > 0) {
    return roundSlotPrice(hr * (chunkSizeMinutes / 60));
  }
  return roundSlotPrice(hr * slotLengthHours(intervalStart, intervalEnd));
}

export function formatPriceForInput(n: number): string {
  const rounded = roundSlotPrice(n);
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}
