import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarDayGroup } from "./FreeTime";

type DayCalendarProps = {
  dates: CalendarDayGroup[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const DayCalendar: React.FC<DayCalendarProps> = ({
  dates,
  selectedDate,
  onDateSelect,
}) => {
  const availableDateSet = useMemo(
    () => new Set(dates.map((item) => item.date)),
    [dates]
  );

  const initialDate =
    selectedDate || dates[0]?.date || formatLocalDate(new Date());

  return (
    // <div className="min-w-0 rounded-[28px] border border-slate-200 bg-slate-50 md:p-5 shadow-sm p-1">
    <div>
      <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="free-time-calendar">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={initialDate}
            headerToolbar={{
              left: "prev",
              center: "title",
              right: "next",
            }}
            fixedWeekCount={false}
            showNonCurrentDates={false}
            height={450}
            dateClick={(info) => {
              const localDate = formatLocalDate(info.date);
              if (availableDateSet.has(localDate)) {
                onDateSelect(localDate);
              }
            }}
            dayCellClassNames={(arg) => {
              const dateStr = formatLocalDate(arg.date);
              const isAvailable = availableDateSet.has(dateStr);
              const isSelected = selectedDate === dateStr;

              return [
                isAvailable ? "ft-day-available" : "ft-day-unavailable",
                isSelected ? "ft-day-selected" : "",
              ];
            }}
            dayCellContent={(arg) => {
              const cellDate = formatLocalDate(arg.date);
              const isToday = cellDate === formatLocalDate(new Date());
              const isSelected = selectedDate === cellDate;

              return (
                <div className="ft-day-number relative">
                  {arg.dayNumberText.replace(/\D/g, "")}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-slate-900" />
                  )}
                </div>
              );
            }}
          />
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-500">Time zone</p>

        <button
          type="button"
          className="mt-3 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition hover:bg-slate-100"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                <circle
                  cx="10"
                  cy="10"
                  r="6.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M3.5 10h13M10 3.5c1.8 1.7 2.7 4 2.7 6.5S11.8 14.8 10 16.5M10 3.5C8.2 5.2 7.3 7.5 7.3 10s.9 4.8 2.7 6.5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-900">
                Central European Time
              </div>
              <div className="text-xs text-slate-500">Current time: 22:49</div>
            </div>
          </div>

          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 text-slate-400"
          >
            <path
              d="m6 8 4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <style>{`
        .free-time-calendar .fc-day-today {
          background: transparent !important;
        }

        .free-time-calendar .fc-daygrid-day-events {
          min-height: 6px !important;
          height: 6px;
        }

        .free-time-calendar .fc-daygrid-day-bottom {
          margin-top: 0 !important;
        }

        .free-time-calendar .fc {
          --fc-border-color: transparent;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: transparent;
          --fc-today-bg-color: transparent;
          font-family: inherit;
        }

        .free-time-calendar .fc-header-toolbar {
          margin-bottom: 0.75rem !important;
          align-items: center;
        }

        .free-time-calendar .fc-toolbar-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: rgb(15 23 42);
        }

        .free-time-calendar .fc-button {
          background: white !important;
          border: 1px solid rgb(226 232 240) !important;
          color: rgb(71 85 105) !important;
          border-radius: 9999px !important;
          width: 40px;
          height: 40px;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .free-time-calendar .fc-button:hover {
          background: rgb(241 245 249) !important;
        }

        .free-time-calendar .fc-button:disabled {
          opacity: 0.5 !important;
        }

        .free-time-calendar .fc-scrollgrid,
        .free-time-calendar .fc-theme-standard td,
        .free-time-calendar .fc-theme-standard th {
          border: none !important;
        }

        .free-time-calendar .fc-col-header-cell-cushion {
          padding: 0.35rem 0;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: rgb(148 163 184);
        }

        .free-time-calendar .fc-daygrid-day-frame {
          padding: 2px;
        }

        .free-time-calendar .fc-daygrid-day-top {
          justify-content: center;
        }

        .free-time-calendar .fc-daygrid-day-number {
          width: 100%;
          padding: 0 !important;
          text-decoration: none !important;
        }

        .free-time-calendar .ft-day-number {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 40px;
          width: 100%;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 150ms ease;
        }

        .free-time-calendar .ft-day-unavailable .ft-day-number {
          background: white;
          color: rgb(203 213 225);
        }

        .free-time-calendar .ft-day-available .ft-day-number {
          background: rgb(255 251 235);
          border: 1px solid rgb(253 230 138);
          color: rgb(15 23 42);
          cursor: pointer;
        }

        .free-time-calendar .ft-day-available .ft-day-number:hover {
          background: rgb(254 243 199);
          border-color: rgb(252 211 77);
        }

        .free-time-calendar .ft-day-selected .ft-day-number {
          background: rgb(15 23 42);
          color: white;
          border: 1px solid rgb(15 23 42);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        }

        .free-time-calendar .fc-bg-event {
          opacity: 0 !important;
        }
      `}</style>
    </div>
    // </div>
  );
};
