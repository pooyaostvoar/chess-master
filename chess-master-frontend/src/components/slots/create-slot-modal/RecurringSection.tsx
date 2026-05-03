import React, { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import type { SlotPeriod } from "./types";
import { HoverTooltipPortal } from "./HoverTooltipPortal";

const CHUNK_HELP =
  "Each slot in the range lasts this long (default 60).";
const OCCURRENCES_HELP =
  "Each occurrence repeats the same time window (split into slots by duration).";

function FieldInfoIcon({
  tooltipId,
  tooltipText,
  disabled,
  modalOpen,
  ariaLabel,
}: {
  tooltipId: string;
  tooltipText: string;
  disabled: boolean;
  modalOpen: boolean;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    if (modalOpen) setInfoOpen(false);
  }, [modalOpen]);

  return (
    <div className="relative flex items-center">
      <button
        ref={ref}
        type="button"
        className="rounded-full p-0.5 text-[#6B5640] transition-colors hover:bg-[#1F1109]/8 hover:text-[#3D2817] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8893D]/50"
        aria-label={ariaLabel}
        aria-describedby={infoOpen ? tooltipId : undefined}
        disabled={disabled}
        onMouseEnter={() => setInfoOpen(true)}
        onMouseLeave={() => setInfoOpen(false)}
        onFocus={() => setInfoOpen(true)}
        onBlur={() => setInfoOpen(false)}
      >
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      <HoverTooltipPortal
        id={tooltipId}
        anchorRef={ref}
        open={infoOpen && !disabled}
      >
        {tooltipText}
      </HoverTooltipPortal>
    </div>
  );
}

export interface RecurringSectionProps {
  /** Resets info tooltips when the modal opens */
  modalOpen: boolean;
  recurring: boolean;
  onRecurringChange: (value: boolean) => void;
  isSubmitting: boolean;
  period: SlotPeriod;
  onPeriodChange: (value: SlotPeriod) => void;
  chunkSizeMinutes: number;
  onChunkSizeMinutesChange: (value: number) => void;
  repeatCount: number;
  onRepeatCountChange: (value: number) => void;
}

const RecurringSection: React.FC<RecurringSectionProps> = ({
  modalOpen,
  recurring,
  onRecurringChange,
  isSubmitting,
  period,
  onPeriodChange,
  chunkSizeMinutes,
  onChunkSizeMinutesChange,
  repeatCount,
  onRepeatCountChange,
}) => (
    <div className="space-y-3">
      <p id="recurring-price-hint" className="sr-only">
        When recurring is selected, the price field applies to each chunk in the
        series.
      </p>

      <select
        id="slot-type"
        value={recurring ? "recurring" : "one-time"}
        onChange={(e) => onRecurringChange(e.target.value === "recurring")}
        disabled={isSubmitting}
        aria-label="Availability type"
        aria-describedby="recurring-price-hint"
        className="h-8 w-44 max-w-full rounded-md border border-[#1F1109]/12 bg-[#fdfaf5] px-2 py-0 text-xs text-[#3D2817] shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8893D]/35 disabled:opacity-60"
      >
        <option value="one-time">One-time (single slot)</option>
        <option value="recurring">Recurring</option>
      </select>

      {recurring && (
        <div className="flex min-w-0 flex-nowrap items-end gap-3 overflow-x-auto rounded-lg border border-[#1F1109]/10 bg-white/60 px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-0 shrink-0 flex-col gap-1">
            <Label
              htmlFor="slot-period"
              className="text-sm font-normal text-[#5C4A3A]"
            >
              Repeat
            </Label>
            <select
              id="slot-period"
              value={period}
              onChange={(e) => onPeriodChange(e.target.value as SlotPeriod)}
              disabled={isSubmitting}
              className="flex h-10 w-[6rem] rounded-md border border-[#1F1109]/15 bg-[#fdfaf5] px-2 py-2 text-sm text-[#3D2817] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8893D]/35 disabled:opacity-60"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="flex min-w-0 shrink-0 flex-col gap-1">
            <div className="flex h-5 items-center gap-0.5">
              <Label
                htmlFor="slot-chunk-minutes"
                className="text-sm font-normal text-[#5C4A3A]"
              >
                Chunk
              </Label>
              <FieldInfoIcon
                tooltipId="slot-chunk-help"
                tooltipText={CHUNK_HELP}
                disabled={isSubmitting}
                modalOpen={modalOpen}
                ariaLabel="About chunk size"
              />
            </div>
            <div className="relative">
              <span
                className="pointer-events-none absolute right-2 top-1/2 z-10 -translate-y-1/2 text-xs text-[#6B5640]"
                aria-hidden
              >
                min
              </span>
              <Input
                id="slot-chunk-minutes"
                type="number"
                min={1}
                step={1}
                value={chunkSizeMinutes}
                onChange={(e) =>
                  onChunkSizeMinutesChange(Number(e.target.value))
                }
                disabled={isSubmitting}
                className="h-10 w-[5rem] border-[#1F1109]/20 bg-white pl-2 pr-9"
              />
            </div>
          </div>

          <div className="flex min-w-0 shrink-0 flex-col gap-1">
            <div className="flex h-5 items-center gap-0.5">
              <Label
                htmlFor="slot-repeat-count"
                className="text-sm font-normal text-[#5C4A3A]"
              >
                Count
              </Label>
              <FieldInfoIcon
                tooltipId="slot-repeat-help"
                tooltipText={OCCURRENCES_HELP}
                disabled={isSubmitting}
                modalOpen={modalOpen}
                ariaLabel="About number of occurrences"
              />
            </div>
            <Input
              id="slot-repeat-count"
              type="number"
              min={1}
              step={1}
              value={repeatCount}
              onChange={(e) => onRepeatCountChange(Number(e.target.value))}
              disabled={isSubmitting}
              className="h-10 w-[4.5rem] border-[#1F1109]/20 bg-white px-2"
            />
          </div>
        </div>
      )}
    </div>
  );

export default RecurringSection;
