import React, { useState } from "react";
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
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString(undefined, options)} – ${end.toLocaleDateString(undefined, options)}`;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => goWeek(-1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#1F1109]/[0.15] text-xs font-medium text-[#3D2817] hover:bg-[#1F1109]/[0.04] transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Prev
        </button>
        <h2
          className="text-lg font-medium text-[#1F1109]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {formatWeekRange(currentWeekStart)}
        </h2>
        <button
          onClick={() => goWeek(1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#1F1109]/[0.15] text-xs font-medium text-[#3D2817] hover:bg-[#1F1109]/[0.04] transition-colors"
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Days Tabs */}
      <div className="flex gap-1.5 overflow-x-auto">
        {DAYS.map((day, idx) => {
          const dayDate = new Date(currentWeekStart);
          dayDate.setDate(currentWeekStart.getDate() + idx);
          const isActive = idx === activeDayIndex;
          const isToday = dayDate.getTime() === today.getTime();
          const isPast = dayDate < today;

          return (
            <button
              key={day}
              className={`px-3.5 py-2 min-w-[56px] text-center text-xs font-medium rounded-lg transition-colors
                ${isActive ? "bg-[#B8893D] text-[#1F1109] shadow-sm" : ""}
                ${!isActive && isToday ? "bg-[#B8893D]/30 text-[#3D2817]" : ""}
                ${!isActive && !isToday ? "bg-[#B8893D]/10 text-[#3D2817] hover:bg-[#B8893D]/20" : ""}
                ${isPast && !isActive ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => !isPast && setActiveDayIndex(idx)}
              disabled={isPast}
            >
              {day} {dayDate.getDate()}
            </button>
          );
        })}
      </div>

      {/* Events for Active Day */}
      <UpcomingEventsSection
        events={getEventsForDay(activeDayIndex)}
        loading={loading}
        loadEvents={loadEvents}
      />
      {getEventsForDay(activeDayIndex).length === 0 && !loading && (
        <p className="text-xs text-[#6B5640] text-center py-4 italic">
          No events this day.
        </p>
      )}
    </div>
  );
};
