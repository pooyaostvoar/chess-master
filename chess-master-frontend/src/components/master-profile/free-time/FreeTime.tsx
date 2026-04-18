import React, { useMemo, useState } from "react";

export default function FreeTime() {
  const availability = [
    {
      day: "Mon",
      date: "2026-04-14",
      slots: ["10:00", "12:30", "16:00", "19:00"],
    },
    {
      day: "Tue",
      date: "2026-04-15",
      slots: ["09:00", "11:30", "15:30"],
    },
    {
      day: "Wed",
      date: "2026-04-16",
      slots: ["10:30", "14:00", "18:30"],
    },
    {
      day: "Thu",
      date: "2026-04-17",
      slots: ["08:30", "13:00", "17:00", "20:00"],
    },
    {
      day: "Fri",
      date: "2026-04-18",
      slots: ["09:30", "12:00", "16:30"],
    },
    {
      day: "Sun",
      date: "2026-04-19",
      slots: [
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30",
        "19:00",
        "19:30",
      ],
    },
    {
      day: "Sun",
      date: "2026-04-26",
      slots: ["12:00", "12:30", "13:00", "14:00", "14:30", "15:00"],
    },
  ];

  const [selectedDate, setSelectedDate] = useState("2026-04-19");

  const selectedDay = useMemo(
    () =>
      availability.find((item) => item.date === selectedDate) ??
      availability[0],
    [selectedDate]
  );

  const availableDateSet = useMemo(
    () => new Set(availability.map((item) => item.date)),
    []
  );

  const calendarDays = [
    "2026-03-30",
    "2026-03-31",
    "2026-04-01",
    "2026-04-02",
    "2026-04-03",
    "2026-04-04",
    "2026-04-05",
    "2026-04-06",
    "2026-04-07",
    "2026-04-08",
    "2026-04-09",
    "2026-04-10",
    "2026-04-11",
    "2026-04-12",
    "2026-04-13",
    "2026-04-14",
    "2026-04-15",
    "2026-04-16",
    "2026-04-17",
    "2026-04-18",
    "2026-04-19",
    "2026-04-20",
    "2026-04-21",
    "2026-04-22",
    "2026-04-23",
    "2026-04-24",
    "2026-04-25",
    "2026-04-26",
    "2026-04-27",
    "2026-04-28",
    "2026-04-29",
    "2026-04-30",
    "2026-05-01",
    "2026-05-02",
    "2026-05-03",
  ];

  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const formatDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getDayNumber = (dateString: string) => Number(dateString.split("-")[2]);

  const isCurrentMonth = (dateString: string) =>
    dateString.startsWith("2026-04-");
  const isToday = (dateString: string) => dateString === "2026-04-17";

  return (
    <div className="text-slate-900">
      <div className="mb-6">
        <h2 className="text-[28px] font-semibold tracking-tight text-slate-900">
          Select a Date &amp; Time
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Choose a day on the calendar and then pick one of the available lesson
          times.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="min-w-0 rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-100"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path
                  d="M12.8 4.5 7 10l5.8 5.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="text-lg font-semibold text-slate-900 sm:text-xl">
              April 2026
            </div>

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100"
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path
                  d="M7.2 4.5 13 10l-5.8 5.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <table className="w-full table-fixed border-separate border-spacing-x-1.5 border-spacing-y-2.5 sm:border-spacing-x-2 sm:border-spacing-y-3">
            <thead>
              <tr>
                {weekdayLabels.map((label) => (
                  <th
                    key={label}
                    className="pb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400 sm:text-[13px]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map(
                (_, rowIndex) => {
                  const week = calendarDays.slice(
                    rowIndex * 7,
                    rowIndex * 7 + 7
                  );

                  return (
                    <tr key={rowIndex}>
                      {week.map((dateString) => {
                        const dayNumber = getDayNumber(dateString);
                        const bookable = availableDateSet.has(dateString);
                        const selected = selectedDate === dateString;
                        const inMonth = isCurrentMonth(dateString);
                        const today = isToday(dateString);

                        return (
                          <td key={dateString} className="align-middle">
                            <button
                              type="button"
                              onClick={() =>
                                bookable && setSelectedDate(dateString)
                              }
                              className={`relative flex h-14 w-full items-center justify-center rounded-[18px] text-sm font-semibold transition sm:h-16 sm:text-base ${
                                selected
                                  ? "bg-slate-900 text-white shadow-sm"
                                  : bookable
                                  ? "border border-amber-200 bg-amber-50 text-slate-900 hover:border-amber-300 hover:bg-amber-100"
                                  : inMonth
                                  ? "border border-transparent bg-white text-slate-300"
                                  : "border border-transparent bg-transparent text-slate-200"
                              }`}
                            >
                              <span>{dayNumber}</span>
                              {today && !selected && (
                                <span className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-slate-900" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>

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
                  <div className="text-xs text-slate-500">
                    Current time: 22:49
                  </div>
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
        </div>

        <div className="min-w-0 rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <div className="border-b border-slate-200 pb-4">
            {/* <div className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Available times
            </div> */}
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {formatDateLabel(selectedDay.date)}
            </h3>
          </div>

          <div className="mt-5 max-h-[620px] space-y-3 overflow-y-auto pr-1">
            {selectedDay.slots.map((slot) => (
              <button
                key={slot}
                type="button"
                className="flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-white px-4 py-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
              >
                <span className="text-sm font-semibold text-slate-900">
                  {slot}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                  Available
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
