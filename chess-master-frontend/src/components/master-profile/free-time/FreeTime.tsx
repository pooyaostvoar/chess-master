import React, { useEffect, useMemo, useRef, useState } from "react";
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
  date: string;
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

type FreeTimeProps = {
  userId: number;
};

export default function FreeTime({ userId }: FreeTimeProps) {
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const slotsTopRef = useRef<HTMLDivElement | null>(null);

  const { rawEvents: scheduleSlots, refreshSlots } = useScheduleSlots(
    userId.toString(),
    {
      showBookingHint: true,
      activeOnly: true,
    }
  );

  const dayGroups = useMemo(
    () => groupSlotsByDay(scheduleSlots),
    [scheduleSlots]
  );

  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (!selectedDate && dayGroups.length > 0) {
      setSelectedDate(dayGroups[0].date);
    }
  }, [dayGroups, selectedDate]);

  const selectedDay = useMemo(
    () => dayGroups.find((day) => day.date === selectedDate) ?? dayGroups[0],
    [dayGroups, selectedDate]
  );

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    if (window.innerWidth >= 768) return;

    ref.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToRef(slotsTopRef);
      });
    });
  };

  const handleBackToCalendar = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToRef(calendarRef);
      });
    });
  };

  if (!scheduleSlots?.length) {
    return null;
  }

  if (!selectedDay) {
    return (
      <div className="text-slate-900">
        <div className="mb-2">
          <h3 className="text-[20px] font-semibold tracking-tight text-slate-900">
            Available Time Slots
          </h3>
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
        <h3 className="text-[20px] font-semibold tracking-tight text-slate-900">
          Available Time Slots
        </h3>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr]">
        <div ref={calendarRef}>
          <DayCalendar
            dates={dayGroups}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        <AvailableSlotsPanel
          selectedDay={selectedDay}
          onBack={handleBackToCalendar}
          onSlotBooked={refreshSlots}
          topRef={slotsTopRef}
        />
      </div>
    </div>
  );
}
