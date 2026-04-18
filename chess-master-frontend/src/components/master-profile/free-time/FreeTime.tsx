import React, { useMemo, useState } from "react";
import { DayCalendar } from "./DayCalendar";
import { AvailableSlotsPanel } from "./AvailableSlotsPanel";

type AvailabilityDay = {
  day: string;
  date: string;
  slots: string[];
};

export default function FreeTime() {
  const availability: AvailabilityDay[] = [
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
    [availability, selectedDate]
  );

  return (
    <div className="text-slate-900">
      <div className="mb-2">
        <h2 className="text-[28px] font-semibold tracking-tight text-slate-900">
          Available Time Slots
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
        <DayCalendar
          dates={availability}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        <AvailableSlotsPanel selectedDay={selectedDay} />
      </div>
    </div>
  );
}
