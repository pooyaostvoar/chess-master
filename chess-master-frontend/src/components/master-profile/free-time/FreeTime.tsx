import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar } from "lucide-react";
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

const SERIF = { fontFamily: "Georgia, serif" } as const;

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
        (a, b) => toDate(a.startTime).getTime() - toDate(b.startTime).getTime(),
      ),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

type FreeTimeProps = {
  userId: number;
  username?: string;
};

function FreeTimeHeader() {
  return (
    <header className="mb-4 shrink-0 md:mb-5">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#B8893D]/15 text-[#B8893D] ring-1 ring-[#B8893D]/20"
          aria-hidden
        >
          <Calendar className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
        <p
          className="text-xs font-semibold tracking-[0.14em] uppercase text-[#7A2E2E] md:text-[13px]"
          style={SERIF}
        >
          Book a lesson
        </p>
      </div>
      <h2
        className="mt-2.5 text-[22px] font-medium leading-tight text-[#1F1109] md:text-[26px]"
        style={SERIF}
      >
        Pick a time
      </h2>
    </header>
  );
}

export default function FreeTime({ userId, username }: FreeTimeProps) {
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const slotsTopRef = useRef<HTMLDivElement | null>(null);

  const { rawEvents: scheduleSlots, refreshSlots } = useScheduleSlots(
    userId.toString(),
    {
      showBookingHint: true,
      activeOnly: true,
    },
  );

  const dayGroups = useMemo(
    () => groupSlotsByDay(scheduleSlots),
    [scheduleSlots],
  );

  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    if (!selectedDate && dayGroups.length > 0) {
      setSelectedDate(dayGroups[0].date);
    }
  }, [dayGroups, selectedDate]);

  const selectedDay = useMemo(
    () => dayGroups.find((day) => day.date === selectedDate) ?? dayGroups[0],
    [dayGroups, selectedDate],
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

  if (!scheduleSlots?.length || !selectedDay) {
    return (
      <div className="text-[#1F1109]">
        <FreeTimeHeader />

        <div className="mt-2 rounded-lg border border-dashed border-[#1F1109]/[0.18] bg-[#FAF5EB]/60 px-5 py-10 text-center md:py-12">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4ECDD] text-[#B8893D]">
            <Calendar className="h-6 w-6" strokeWidth={1.6} />
          </div>
          <p className="text-sm font-medium text-[#1F1109]" style={SERIF}>
            No availability published yet
          </p>
          <p className="mt-1.5 max-w-sm mx-auto text-[13px] leading-relaxed text-[#6B5640]">
            {username
              ? `${username} hasn't opened any lesson slots for booking. Send them a message and they'll get back to you.`
              : "This coach hasn't opened any lesson slots for booking yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-[#1F1109]">
      <FreeTimeHeader />

      <div className="mt-4 grid gap-6 md:mt-5 md:grid-cols-[1.05fr_0.95fr] md:items-start">
        <div ref={calendarRef}>
          <DayCalendar
            dates={dayGroups}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>

        <div className="min-w-0">
          <AvailableSlotsPanel
            selectedDay={selectedDay}
            onBack={handleBackToCalendar}
            onSlotBooked={refreshSlots}
            topRef={slotsTopRef}
          />
        </div>
      </div>
    </div>
  );
};
