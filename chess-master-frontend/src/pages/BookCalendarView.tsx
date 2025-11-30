import React, { useRef } from "react";
import { useParams } from "react-router-dom";
import { bookSlot } from "../services/schedule";
import { useScheduleSlots } from "../hooks/useScheduleSlots";
import { useMasterInfo } from "../hooks/useMasterInfo";
import ScheduleCalendar, {
  ScheduleCalendarRef,
} from "../components/ScheduleCalendar";
import MiniCalendar from "../components/calendar/MiniCalendar";
import MasterInfoHeader from "../components/MasterInfoHeader";
import SlotLegend from "../components/SlotLegend";
import { useIsMobile } from "../hooks/useIsMobile";

const BookCalendarView: React.FC = () => {
  const isMobile = useIsMobile();
  const { userId } = useParams<{ userId: string }>();
  const { events, refreshSlots } = useScheduleSlots(userId, {
    showBookingHint: true,
  });
  const { masterInfo } = useMasterInfo(userId);
  const calendarRef = useRef<ScheduleCalendarRef>(null);

  const handleDateSelect = (date: Date) => {
    if (calendarRef.current && date) {
      // Ensure date is valid
      if (!isNaN(date.getTime())) {
        const currentView = calendarRef.current.getCurrentView();
        const dateRange = calendarRef.current.getCurrentDateRange();

        // Check if we're in week view and if the date is within the current week
        if (currentView === "timeGridWeek" && dateRange) {
          const targetDate = new Date(date);
          targetDate.setHours(0, 0, 0, 0);

          const rangeStart = new Date(dateRange.start);
          rangeStart.setHours(0, 0, 0, 0);

          const rangeEnd = new Date(dateRange.end);
          rangeEnd.setHours(0, 0, 0, 0);

          // Check if date is within the current week range
          // Note: rangeEnd is exclusive, so we check < rangeEnd
          const isInCurrentWeek =
            targetDate >= rangeStart && targetDate < rangeEnd;

          if (isInCurrentWeek) {
            // Date is in current week, switch to day view
            calendarRef.current.gotoDate(date, true);
          } else {
            // Date is outside current week, navigate to that week (stay in week view)
            // Explicitly stay in week view by passing false
            calendarRef.current.gotoDate(date, false);
          }
        } else if (currentView === "timeGridDay") {
          // Already in day view, just navigate to the date
          calendarRef.current.gotoDate(date, true);
        } else {
          // Not in week or day view, switch to day view
          calendarRef.current.gotoDate(date, true);
        }
      }
    }
  };

  // Book a slot
  const handleEventClick = async (info: any) => {
    const slotId = Number(info.event.id);
    const slotStart = new Date(info.event.start);
    const now = new Date();

    // Prevent booking slots in the past
    if (slotStart < now) {
      alert(
        "Cannot book time slots in the past. Please select a future date and time."
      );
      return;
    }

    // Only allow booking free slots (green color)
    if (info.event.backgroundColor !== "#27ae60") {
      return;
    }

    if (
      !window.confirm(
        `Request this time slot?\n${info.event.startStr} - ${info.event.endStr}\n\nThe master will need to approve your request.`
      )
    ) {
      return;
    }

    try {
      await bookSlot(slotId);
      // Reload slots to update the UI
      await refreshSlots();
      alert("Slot request sent! The master will review your request.");
    } catch (err: any) {
      console.error("Failed to book slot", err);
      alert(
        err.response?.data?.error || "Failed to book slot. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex gap-6 p-6 max-w-[1800px] mx-auto">
        {/* Left Sidebar - Mini Calendar */}
        {isMobile === false && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-card rounded-lg border p-4 sticky top-6">
              <MiniCalendar onDateSelect={handleDateSelect} />
            </div>
          </div>
        )}

        {/* Right Side - Main Calendar */}
        <div className="flex-1 min-w-0">
          {masterInfo && <MasterInfoHeader masterInfo={masterInfo} />}

          <div className="bg-[#fafafa] rounded-2xl border shadow-sm p-6 calendar-main-container mt-6">
            <ScheduleCalendar
              ref={calendarRef}
              events={events}
              selectable={false}
              editable={false}
              onEventClick={handleEventClick}
              height="calc(100vh - 200px)"
            />
          </div>

          <SlotLegend />
        </div>
      </div>
    </div>
  );
};

export default BookCalendarView;
