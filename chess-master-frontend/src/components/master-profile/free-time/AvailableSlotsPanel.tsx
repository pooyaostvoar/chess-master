import React from "react";

type AvailabilityDay = {
  day: string;
  date: string;
  slots: string[];
};

type AvailableSlotsPanelProps = {
  selectedDay: AvailabilityDay;
};

export const AvailableSlotsPanel: React.FC<AvailableSlotsPanelProps> = ({
  selectedDay,
}) => {
  const formatDateLabel = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="free-time-scroll min-w-0 overflow-y-auto rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm pr-1 overflow-x-hidden">
      <div className="sticky top-0 z-10 -mx-5 bg-slate-50 px-5 pb-4 pt-1 border-b border-slate-200">
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {formatDateLabel(selectedDay.date)}
        </h3>
      </div>

      <div className="mt-5 max-h-[620px] space-y-3">
        {selectedDay.slots.map((slot) => (
          <button
            key={slot}
            type="button"
            className="flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-white px-4 py-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
          >
            <span className="text-sm font-semibold text-slate-900">{slot}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              Available
            </span>
          </button>
        ))}
      </div>
      <style>{`
            /* ===== Scrollbar (Chrome, Edge, Safari) ===== */
            .free-time-scroll::-webkit-scrollbar {
            width: 6px;
            }

            .free-time-scroll::-webkit-scrollbar-track {
            background: transparent;
            }

            .free-time-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(100, 116, 139, 0.25); /* soft slate */
            border-radius: 9999px;
            transition: background-color 0.2s ease;
            }

            .free-time-scroll::-webkit-scrollbar-thumb:hover {
            background-color: rgba(100, 116, 139, 0.45);
            }

            /* ===== Firefox ===== */
            .free-time-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(100, 116, 139, 0.25) transparent;
            }

            /* ===== Optional: hidden until hover (more premium) ===== */
            .free-time-scroll::-webkit-scrollbar-thumb {
            background-color: transparent;
            }

            .free-time-scroll:hover::-webkit-scrollbar-thumb {
            background-color: rgba(100, 116, 139, 0.35);
            }
`}</style>
    </div>
  );
};
