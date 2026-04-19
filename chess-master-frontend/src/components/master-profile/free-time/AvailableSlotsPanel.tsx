import React from "react";
import type { CalendarDayGroup, ScheduleSlot } from "./FreeTime";

type AvailableSlotsPanelProps = {
  selectedDay: CalendarDayGroup;
  onBack: () => void;
  topRef?: React.RefObject<HTMLDivElement | null>;
};

const toDate = (value: Date | string) =>
  value instanceof Date ? value : new Date(value);

const formatDateLabel = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

const formatSlotTime = (slot: ScheduleSlot) => {
  return toDate(slot.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatPrice = (slot: ScheduleSlot) => {
  if (slot.price == null) return null;
  return `€${Number(slot.price).toFixed(0)}`;
};

export const AvailableSlotsPanel: React.FC<AvailableSlotsPanelProps> = ({
  selectedDay,
  onBack,
  topRef,
}) => {
  return (
    <div>
      <div ref={topRef} className="h-px scroll-mt-20" />

      <div className="free-time-scroll mt-0 max-h-[620px] overflow-y-auto overflow-x-hidden pr-1">
        <div className="sticky top-0 z-10 bg-white">
          <button
            type="button"
            onClick={onBack}
            className="md:hidden inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 text-slate-500"
            >
              <path
                d="M12.5 15 7.5 10l5-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to calendar
          </button>

          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
            {formatDateLabel(selectedDay.date)}
          </h3>
        </div>

        <div className="mt-5 space-y-3">
          {selectedDay.slots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-white px-4 py-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">
                  {formatSlotTime(slot)}
                </div>
                {slot.title && (
                  <div className="mt-1 truncate text-xs text-slate-500">
                    {slot.title}
                  </div>
                )}
              </div>

              <div className="ml-4 flex shrink-0 items-center gap-2">
                {formatPrice(slot) && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                    {formatPrice(slot)}
                  </span>
                )}
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  Available
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .free-time-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .free-time-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .free-time-scroll::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 9999px;
        }

        .free-time-scroll:hover::-webkit-scrollbar-thumb {
          background-color: rgba(100, 116, 139, 0.35);
        }

        .free-time-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.35) transparent;
        }
      `}</style>
    </div>
  );
};
