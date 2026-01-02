import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";

import { useScheduleSlots } from "../hooks/useScheduleSlots";
import { mapSlotToEvent } from "../utils/slotUtils";
import ScheduleCalendar, {
  ScheduleCalendarRef,
} from "../components/ScheduleCalendar";
import MiniCalendar from "../components/calendar/MiniCalendar";
import SlotModal from "../components/SlotModal";
import { useIsMobile } from "../hooks/useIsMobile";
import EditSlotModal from "../components/slots/EditSlotModal";
import { useCurrentUserSchedule } from "../contexts/ScheduleContext";

const MasterCalendarView: React.FC = () => {
  const isMobile = useIsMobile();
  const { userId } = useParams<{ userId: string }>();
  const { events, setEvents, refreshSlots } = useScheduleSlots(userId, {
    isMasterView: true,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditSlotModalVisible, setIsEditSlotModalVisible] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const calendarRef = useRef<ScheduleCalendarRef>(null);
  const { createSlot } = useCurrentUserSchedule();
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

  // Create new slot
  const handleSelect = async (info: any) => {
    const start = new Date(info.startStr);
    const now = new Date();

    // Prevent creating slots in the past
    if (start < now) {
      alert(
        "Cannot create time slots in the past. Please select a future date and time."
      );
      return;
    }

    try {
      const newSlot = await createSlot({
        startTime: info.startStr,
        endTime: info.endStr,
      });

      setEvents((prev) => [...prev, mapSlotToEvent(newSlot)]);
      setSelectedSlotId(newSlot.id);
      setIsEditSlotModalVisible(true);
    } catch (err: any) {
      console.error("Failed to create slot", err);
      alert(
        err.response?.data?.error || "Failed to create slot. Please try again."
      );
    }
  };

  // Open modal to manage slot
  const handleEventClick = (info: any) => {
    setSelectedSlotId(Number(info.event.id));
    setSelectedSlot(info.event.extendedProps?.fullSlot || null);
    setModalVisible(true);
  };

  // Drag & drop update
  const handleEventDrop = async (info: any) => {
    const newStart = new Date(info.event.start);
    const now = new Date();

    // Prevent moving slots to the past
    if (newStart < now) {
      info.revert();
      alert(
        "Cannot move time slots to the past. Please select a future date and time."
      );
      return;
    }

    try {
      const { updateSlot } = await import("../services/schedule");
      await updateSlot(Number(info.event.id), {
        startTime: info.event.start.toISOString(),
        endTime: info.event.end.toISOString(),
      });
      // Refresh slots to get updated data
      await refreshSlots();
    } catch (err: any) {
      console.error("Failed to update slot", err);
      info.revert();
      alert(err.message || "Failed to update slot. Please try again.");
    }
  };

  // Resize update
  const handleEventResize = async (info: any) => {
    const newStart = new Date(info.event.start);
    const now = new Date();

    // Prevent resizing slots to the past
    if (newStart < now) {
      info.revert();
      alert(
        "Cannot resize time slots to the past. Please select a future date and time."
      );
      return;
    }

    try {
      const { updateSlot } = await import("../services/schedule");
      await updateSlot(Number(info.event.id), {
        startTime: info.event.start.toISOString(),
        endTime: info.event.end.toISOString(),
      });
      // Refresh slots to get updated data
      await refreshSlots();
    } catch (err: any) {
      console.error("Failed to resize slot", err);
      info.revert();
      alert(err.message || "Failed to resize slot. Please try again.");
    }
  };

  // Handle delete from modal
  const handleDeleted = (deletedId: number) => {
    setEvents((prev) => prev.filter((e) => e.id !== deletedId));
  };

  const handleStatusChange = (updatedSlot: any) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === updatedSlot.id
          ? mapSlotToEvent(updatedSlot, { isMasterView: true })
          : e
      )
    );
    // Refresh to get updated relations
    refreshSlots();
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
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Schedule</h1>
            <p className="text-muted-foreground">
              Click and drag to create time slots, or click existing slots to
              manage them
            </p>
          </div>

          <div className="bg-[#fafafa] rounded-2xl border shadow-sm p-6 calendar-main-container">
            <ScheduleCalendar
              ref={calendarRef}
              events={events}
              selectable={true}
              editable={true}
              onSelect={handleSelect}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              //   height="calc(100vh - 200px)"
            />
          </div>
        </div>
      </div>

      <SlotModal
        visible={modalVisible}
        slotId={selectedSlotId}
        slot={selectedSlot}
        onClose={() => {
          setModalVisible(false);
          setSelectedSlot(null);
        }}
        onDeleted={handleDeleted}
        onStatusChange={handleStatusChange}
      />
      <EditSlotModal
        visible={isEditSlotModalVisible}
        slotId={selectedSlotId}
        onClose={() => {
          setSelectedSlotId(null);
          setIsEditSlotModalVisible(false);
          refreshSlots();
        }}
      />
    </div>
  );
};

export default MasterCalendarView;
