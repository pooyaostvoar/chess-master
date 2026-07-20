import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./month-day-picker.css";

export type MonthDayPickerProps = {
  /** Dates (YYYY-MM-DD) to highlight as having slots. */
  availableDates?: string[];
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  /** Override the bordered card surface classes (bg, border, shadow, etc.). */
  cardClassName?: string;
  className?: string;
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Month picker for the master schedule page only (not master profile). */
export const MonthDayPicker: React.FC<MonthDayPickerProps> = ({
  availableDates = [],
  selectedDate = "",
  onDateSelect,
  cardClassName,
  className,
}) => {
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates],
  );

  const initialDate =
    selectedDate || availableDates[0] || formatLocalDate(new Date());

  return (
    <div
      className={
        cardClassName ??
        "rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      }
    >
      <div className={`month-day-picker${className ? ` ${className}` : ""}`}>
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
          contentHeight="auto"
          dateClick={(info) => {
            onDateSelect(formatLocalDate(info.date));
          }}
          dayCellClassNames={(arg) => {
            const dateStr = formatLocalDate(arg.date);
            const isAvailable = availableDateSet.has(dateStr);
            const isSelected = selectedDate === dateStr;

            return [
              isAvailable ? "mdp-day-available" : "mdp-day-default",
              isSelected ? "mdp-day-selected" : "",
            ];
          }}
          dayCellContent={(arg) => {
            const cellDate = formatLocalDate(arg.date);
            const isToday = cellDate === formatLocalDate(new Date());
            const isSelected = selectedDate === cellDate;

            return (
              <div className="mdp-day-number relative">
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
  );
};

export default MonthDayPicker;
