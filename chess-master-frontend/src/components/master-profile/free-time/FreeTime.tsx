import React, { useMemo, useState } from "react";
import { DayCalendar } from "./DayCalendar";
import { AvailableSlotsPanel } from "./AvailableSlotsPanel";
import { useScheduleSlots } from "../../../hooks/useScheduleSlots";

export enum SlotStatus {
  Free = "free",
  Reserved = "reserved",
  Paid = "paid",
  Cancelled = "cancelled",
}

export type ScheduleSlot = {
  id: number;
  startTime: Date | string;
  endTime: Date | string;
  status: SlotStatus | string;
  title: string | null;
  description: string | null;
  youtubeId: string | null;
  reservedById: number | null;
  price: number | null;
  priceCents: number | null;
};

export type CalendarDayGroup = {
  date: string; // YYYY-MM-DD in browser local time
  slots: ScheduleSlot[];
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDate = (value: Date | string) =>
  value instanceof Date ? value : new Date(value);

const groupSlotsByDay = (slots: ScheduleSlot[]): CalendarDayGroup[] => {
  const grouped = new Map<string, ScheduleSlot[]>();

  for (const slot of slots) {
    const start = toDate(slot.startTime);
    const localDate = formatLocalDate(start);

    if (!grouped.has(localDate)) {
      grouped.set(localDate, []);
    }

    grouped.get(localDate)!.push(slot);
  }

  return Array.from(grouped.entries())
    .map(([date, daySlots]) => ({
      date,
      slots: [...daySlots].sort(
        (a, b) => toDate(a.startTime).getTime() - toDate(b.startTime).getTime()
      ),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export default function FreeTime({ userId }: { userId: number }) {
  const { rawEvents: scheduleSlots, refreshSlots } = useScheduleSlots(
    userId.toString(),
    {
      showBookingHint: true,
    }
  );

  const dayGroups = groupSlotsByDay(
    scheduleSlots.filter((slot) => slot.status === SlotStatus.Free)
  );
  console.log(
    dayGroups,
    "aaaa",
    scheduleSlots.filter((slot) => slot.status === SlotStatus.Free),
    scheduleSlots
  );

  const [selectedDate, setSelectedDate] = useState<string>(
    dayGroups[0]?.date ?? ""
  );

  const selectedDay =
    dayGroups.find((day) => day.date === selectedDate) ?? dayGroups[0];

  if (!scheduleSlots?.length) {
    return null;
  }
  if (!selectedDay) {
    return (
      <div className="text-slate-900">
        <div className="mb-2">
          <h2 className="text-[28px] font-semibold tracking-tight text-slate-900">
            Available Time Slots
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            No available lessons at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-slate-900">
      <div className="mb-2">
        <h2 className="text-[28px] font-semibold tracking-tight text-slate-900">
          Available Time Slots
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
        <DayCalendar
          dates={dayGroups}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        <AvailableSlotsPanel selectedDay={selectedDay} />
      </div>
    </div>
  );
}
