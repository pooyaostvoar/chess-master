import React from "react";
import type { CalendarDayGroup, ScheduleSlot } from "./FreeTime";

type AvailableSlotsPanelProps = {
  selectedDay: CalendarDayGroup;
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
}) => {
  return (
    // <div className="min-w-0 rounded-[28px] border border-slate-200 bg-slate-50 md:p-5 p-1 shadow-sm">
    <div>
      <div className="free-time-scroll mt-0 max-h-[620px] overflow-y-auto overflow-x-hidden pr-1">
        {/* <div className="sticky top-0 z-10 -mx-5 border-b border-slate-200 bg-slate-50 px-5 pb-4 pt-1"> */}
        <div className="sticky top-0 z-10 ">
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
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
    // </div>
  );
};
