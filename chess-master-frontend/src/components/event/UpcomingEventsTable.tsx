import React, { useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { UpcomingEventsSection } from "./UpcomingEventsSection";

interface Event {
  id: string;
  title?: string;
  master: any;
  startTime: string;
  endTime: string;
  price?: number;
}

interface Props {
  events: Event[];
  loadEvents: () => void;
  loading: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const UpcomingEventsTable: React.FC<Props> = ({
  events,
  loadEvents,
  loading,
}) => {
  // Current week start (Sunday)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  });

  const [activeDayIndex, setActiveDayIndex] = useState(new Date().getDay());

  const goWeek = (direction: 1 | -1) => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7 * direction);
    setCurrentWeekStart(newStart);
    setActiveDayIndex(newStart.getDay());
  };

  const getEventsForDay = (dayIndex: number) => {
    const dayDate = new Date(currentWeekStart);
    dayDate.setDate(currentWeekStart.getDate() + dayIndex);
    dayDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(dayDate);
    nextDay.setDate(dayDate.getDate() + 1);

    return events
      .filter((e) => {
        const start = new Date(e.startTime);
        return start >= dayDate && start < nextDay;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  };

  const formatWeekRange = (start: Date) => {
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };

    return `${start.toLocaleDateString(
      undefined,
      options
    )} – ${end.toLocaleDateString(undefined, options)}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          onClick={() => goWeek(-1)}
          className="flex items-center gap-1 border-blue-500 text-blue-500 hover:bg-blue-50"
        >
          <ChevronLeft className="w-4 h-4" /> Prev Week
        </Button>
        <h2 className="text-2xl font-bold text-gray-800">
          {formatWeekRange(currentWeekStart)}
        </h2>
        <Button
          variant="outline"
          onClick={() => goWeek(1)}
          className="flex items-center gap-1 border-blue-500 text-blue-500 hover:bg-blue-50"
        >
          Next Week <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Days Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {DAYS.map((day, idx) => {
          const dayDate = new Date(currentWeekStart);
          dayDate.setDate(currentWeekStart.getDate() + idx);

          const isActive = idx === activeDayIndex;
          const isToday = dayDate.getTime() === today.getTime();
          const isPast = dayDate < today;

          return (
            <button
              key={day}
              className={`px-4 py-2 min-w-[60px] text-center font-medium rounded-lg transition-colors
                ${isActive ? "bg-blue-600 text-white shadow" : ""}
                ${!isActive && isToday ? "bg-blue-400 text-white shadow" : ""}
                ${
                  !isActive && !isToday
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    : ""
                }
                ${isPast && !isActive ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={() => !isPast && setActiveDayIndex(idx)}
              disabled={isPast}
            >
              {day} {dayDate.getDate()}
            </button>
          );
        })}
      </div>

      {/* Events for Active Day */}
      <>
        <UpcomingEventsSection
          events={getEventsForDay(activeDayIndex)}
          loading={loading}
          loadEvents={loadEvents}
        />
        {getEventsForDay(activeDayIndex).length === 0 && (
          <p className="text-gray-500 col-span-full mt-4">
            No events this day.
          </p>
        )}
      </>
    </div>
  );
};
