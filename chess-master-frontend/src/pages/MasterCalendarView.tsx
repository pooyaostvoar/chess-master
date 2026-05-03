import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useUser } from "../contexts/UserContext";
import { useScheduleSlots } from "../hooks/useScheduleSlots";
import { mapSlotToEvent, slotIsPeriodicSeriesChunk } from "../utils/slotUtils";
import ScheduleCalendar, {
  ScheduleCalendarRef,
} from "../components/ScheduleCalendar";
import MiniCalendar from "../components/calendar/MiniCalendar";
import SlotModal from "../components/SlotModal";
import { useIsMobile } from "../hooks/useIsMobile";
import CreateSlotModal from "../components/slots/CreateSlotModal";
import PeriodicSeriesMoveModal from "../components/slots/PeriodicSeriesMoveModal";
import EditSlotSection from "../components/slots/EditSlotSection";
import type { PeriodicScopeSubmitPayload } from "../components/slots/EditSlotSection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { createPeriodicBatchSlots } from "../services/schedule";

const DRAFT_EVENT_ID = "draft-slot-pending";

type PendingSeriesMove = {
  revert: () => void;
  slotId: number;
  startIso: string;
  endIso: string;
};

type PendingPeriodicEdit = {
  slotId: number;
  payload: PeriodicScopeSubmitPayload;
};

const MasterCalendarView: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { userId } = useParams<{ userId: string }>();
  const { events, setEvents, refreshSlots } = useScheduleSlots(userId, {
    isMasterView: true,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const calendarRef = useRef<ScheduleCalendarRef>(null);

  const [draftRange, setDraftRange] = useState<{
    startStr: string;
    endStr: string;
  } | null>(null);
  const [isCreatingSlots, setIsCreatingSlots] = useState(false);

  const [inlineEditOpen, setInlineEditOpen] = useState(false);
  const [periodicEditPayload, setPeriodicEditPayload] =
    useState<PendingPeriodicEdit | null>(null);
  const [periodicEditSubmitting, setPeriodicEditSubmitting] = useState(false);
  const closePeriodicEditModalWithoutClearRef = useRef(false);
  /** After opening inline edit from SlotModal, reopen slot modal when edit closes. */
  const resumeSlotModalAfterInlineEditRef = useRef(false);

  const reopenSlotModalAfterInlineEditIfNeeded = () => {
    if (resumeSlotModalAfterInlineEditRef.current) {
      resumeSlotModalAfterInlineEditRef.current = false;
      setModalVisible(true);
    }
  };

  /** After “Apply changes” (recurring save), close slot + edit flow entirely and show the calendar. */
  const closeAllModalsAfterPeriodicEditSave = () => {
    resumeSlotModalAfterInlineEditRef.current = false;
    setModalVisible(false);
    setInlineEditOpen(false);
    setSelectedSlot(null);
    setSelectedSlotId(null);
  };

  const [pendingSeriesMove, setPendingSeriesMove] =
    useState<PendingSeriesMove | null>(null);
  const [seriesMoveSubmitting, setSeriesMoveSubmitting] = useState(false);
  const closeSeriesModalWithoutRevertRef = useRef(false);

  const handleSeriesMoveDialogOpenChange = (open: boolean) => {
    if (open) return;
    if (closeSeriesModalWithoutRevertRef.current) {
      closeSeriesModalWithoutRevertRef.current = false;
      setPendingSeriesMove(null);
      return;
    }
    pendingSeriesMove?.revert();
    setPendingSeriesMove(null);
  };

  const handleSeriesMoveUpdateAll = async () => {
    const pending = pendingSeriesMove;
    if (!pending) return;
    setSeriesMoveSubmitting(true);
    try {
      const { updatePeriodicBatchSlots } = await import("../services/schedule");
      await updatePeriodicBatchSlots({
        slotId: pending.slotId,
        startTime: new Date(pending.startIso),
        endTime: new Date(pending.endIso),
      });
      closeSeriesModalWithoutRevertRef.current = true;
      setPendingSeriesMove(null);
      await refreshSlots();
    } catch (err: any) {
      console.error("Failed to update series", err);
      alert(err.message || "Failed to update series.");
      pending.revert();
      setPendingSeriesMove(null);
    } finally {
      setSeriesMoveSubmitting(false);
    }
  };

  const handleSeriesMoveUpdateThis = async () => {
    const pending = pendingSeriesMove;
    if (!pending) return;
    setSeriesMoveSubmitting(true);
    try {
      const { updateSlot } = await import("../services/schedule");
      await updateSlot(pending.slotId, {
        startTime: pending.startIso,
        endTime: pending.endIso,
      });
      closeSeriesModalWithoutRevertRef.current = true;
      setPendingSeriesMove(null);
      await refreshSlots();
    } catch (err: any) {
      console.error("Failed to update slot", err);
      alert(err.message || "Failed to update slot.");
      pending.revert();
      setPendingSeriesMove(null);
    } finally {
      setSeriesMoveSubmitting(false);
    }
  };

  const handlePeriodicEditDialogOpenChange = (open: boolean) => {
    if (open) return;
    if (closePeriodicEditModalWithoutClearRef.current) {
      closePeriodicEditModalWithoutClearRef.current = false;
      setPeriodicEditPayload(null);
      return;
    }
    setPeriodicEditPayload(null);
  };

  const handlePeriodicEditUpdateAll = async () => {
    const pending = periodicEditPayload;
    if (!pending) return;
    setPeriodicEditSubmitting(true);
    try {
      const { updatePeriodicBatchSlots } = await import("../services/schedule");
      await updatePeriodicBatchSlots({
        slotId: pending.slotId,
        startTime: new Date(pending.payload.startTime),
        endTime: new Date(pending.payload.endTime),
        title: pending.payload.title ?? null,
        youtubeId: pending.payload.youtubeId ?? null,
        price: Number.isFinite(pending.payload.price)
          ? pending.payload.price
          : null,
      });
      closePeriodicEditModalWithoutClearRef.current = true;
      setPeriodicEditPayload(null);
      closeAllModalsAfterPeriodicEditSave();
      await refreshSlots();
    } catch (err: any) {
      console.error("Failed to update series", err);
      alert(err.message || "Failed to update series.");
    } finally {
      setPeriodicEditSubmitting(false);
    }
  };

  const handlePeriodicEditUpdateThis = async () => {
    const pending = periodicEditPayload;
    if (!pending) return;
    setPeriodicEditSubmitting(true);
    try {
      const { updateSlot } = await import("../services/schedule");
      await updateSlot(pending.slotId, {
        startTime: pending.payload.startTime,
        endTime: pending.payload.endTime,
        title: pending.payload.title,
        youtubeId: pending.payload.youtubeId,
        price: pending.payload.price,
        description: pending.payload.description,
      });
      closePeriodicEditModalWithoutClearRef.current = true;
      setPeriodicEditPayload(null);
      closeAllModalsAfterPeriodicEditSave();
      await refreshSlots();
    } catch (err: any) {
      console.error("Failed to update slot", err);
      alert(err.message || "Failed to update slot.");
    } finally {
      setPeriodicEditSubmitting(false);
    }
  };

  const calendarEvents = useMemo(() => {
    const list = [...events];
    if (draftRange) {
      list.push({
        id: DRAFT_EVENT_ID,
        title: "Draft — confirm below",
        start: draftRange.startStr,
        end: draftRange.endStr,
        backgroundColor: "#95a5a6",
        borderColor: "#7f8c8d",
        editable: false,
        durationEditable: false,
        extendedProps: { isDraft: true },
      });
    }
    return list;
  }, [events, draftRange]);

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

  // Drag-select: draft only, then confirm in modal
  const handleSelect = (info: any) => {
    const start = new Date(info.startStr);
    const now = new Date();

    if (start < now) {
      alert(
        "Cannot create time slots in the past. Please select a future date and time."
      );
      return;
    }

    setDraftRange({
      startStr: info.startStr,
      endStr: info.endStr,
    });
  };

  const clearDraft = () => {
    setDraftRange(null);
  };

  const handleDraftModalOpenChange = (open: boolean) => {
    if (!open) {
      clearDraft();
    }
  };

  const handleCreateSlotConfirm = async (payload: {
    recurring: boolean;
    period: "daily" | "weekly" | "monthly";
    repeatCount: number;
    chunkSizeMinutes?: number;
    title: string | null;
    description: string | null;
    price: number | null;
    youtubeId: string | null;
  }) => {
    if (!draftRange) return;

    setIsCreatingSlots(true);
    try {
      await createPeriodicBatchSlots({
        interval: {
          start: draftRange.startStr,
          end: draftRange.endStr,
        },
        period: payload.recurring ? payload.period : "daily",
        repeatCount: payload.recurring ? payload.repeatCount : 1,
        ...(payload.recurring && payload.chunkSizeMinutes != null
          ? { chunkSizeMinutes: payload.chunkSizeMinutes }
          : {}),
        title: payload.title,
        description: payload.description,
        price: payload.price,
        youtubeId: payload.youtubeId,
      });

      await refreshSlots();

      clearDraft();
    } catch (err: any) {
      console.error("Failed to create slots", err);
      alert(err.message || "Failed to create slots. Please try again.");
    } finally {
      setIsCreatingSlots(false);
    }
  };

  // Open modal to manage slot
  const handleEventClick = (info: any) => {
    if (info.event.id === DRAFT_EVENT_ID) {
      return;
    }
    setSelectedSlotId(Number(info.event.id));
    setSelectedSlot(info.event.extendedProps?.fullSlot || null);
    setModalVisible(true);
  };

  // Drag & drop update
  const handleEventDrop = async (info: any) => {
    if (info.event.id === DRAFT_EVENT_ID) {
      info.revert();
      return;
    }
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

    const slotId = Number(info.event.id);
    const fullSlot = info.event.extendedProps?.fullSlot;
    const startIso = info.event.start.toISOString();
    const endIso = info.event.end.toISOString();

    if (!slotIsPeriodicSeriesChunk(fullSlot)) {
      try {
        const { updateSlot } = await import("../services/schedule");
        await updateSlot(slotId, { startTime: startIso, endTime: endIso });
        await refreshSlots();
      } catch (err: any) {
        console.error("Failed to update slot", err);
        info.revert();
        alert(err.message || "Failed to update slot. Please try again.");
      }
      return;
    }

    setPendingSeriesMove({
      revert: () => info.revert(),
      slotId,
      startIso,
      endIso,
    });
  };

  // Resize update
  const handleEventResize = async (info: any) => {
    if (info.event.id === DRAFT_EVENT_ID) {
      info.revert();
      return;
    }
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

    const slotId = Number(info.event.id);
    const fullSlot = info.event.extendedProps?.fullSlot;
    const startIso = info.event.start.toISOString();
    const endIso = info.event.end.toISOString();

    if (!slotIsPeriodicSeriesChunk(fullSlot)) {
      try {
        const { updateSlot } = await import("../services/schedule");
        await updateSlot(slotId, { startTime: startIso, endTime: endIso });
        await refreshSlots();
      } catch (err: any) {
        console.error("Failed to resize slot", err);
        info.revert();
        alert(err.message || "Failed to resize slot. Please try again.");
      }
      return;
    }

    setPendingSeriesMove({
      revert: () => info.revert(),
      slotId,
      startIso,
      endIso,
    });
  };

  // Handle delete from modal (single id or whole series)
  const handleDeleted = (deletedIds: number[]) => {
    const idSet = new Set(deletedIds.map(Number));
    setEvents((prev) => prev.filter((e) => !idSet.has(Number(e.id))));
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

  const blockCalendarInteraction =
    isCreatingSlots ||
    Boolean(pendingSeriesMove) ||
    seriesMoveSubmitting ||
    inlineEditOpen ||
    Boolean(periodicEditPayload) ||
    periodicEditSubmitting;

  return (
    <div className="min-h-screen bg-[#FAF5EB]">
      <div className="flex gap-6 p-6 max-w-[1800px] mx-auto">
        {/* Left Sidebar - Mini Calendar */}
        {isMobile === false && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-[#1F1109]/[0.12] p-4 sticky top-6">
              <MiniCalendar onDateSelect={handleDateSelect} />
            </div>
          </div>
        )}
        {/* Right Side - Main Calendar */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <div
              className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Your calendar
            </div>
            <h1
              className="text-2xl sm:text-3xl font-medium text-[#1F1109] leading-[1.1] tracking-[-0.01em] mb-1"
              style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
            >
              My Schedule
            </h1>
            <p className="text-[13px] text-[#5C4631]">
              Click and drag to choose a time window, then confirm one-time or
              recurring slots
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#1F1109]/[0.12] shadow-sm p-6 calendar-main-container">
            <ScheduleCalendar
              ref={calendarRef}
              events={calendarEvents}
              selectable={!blockCalendarInteraction}
              editable={!blockCalendarInteraction}
              onSelect={handleSelect}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
              //   height="calc(100vh - 200px)"
            />
          </div>
        </div>
      </div>

      <PeriodicSeriesMoveModal
        open={pendingSeriesMove !== null}
        isSubmitting={seriesMoveSubmitting}
        onOpenChange={handleSeriesMoveDialogOpenChange}
        onUpdateAll={handleSeriesMoveUpdateAll}
        onUpdateThis={handleSeriesMoveUpdateThis}
      />

      <PeriodicSeriesMoveModal
        open={periodicEditPayload !== null}
        isSubmitting={periodicEditSubmitting}
        onOpenChange={handlePeriodicEditDialogOpenChange}
        onUpdateAll={handlePeriodicEditUpdateAll}
        onUpdateThis={handlePeriodicEditUpdateThis}
        heading="Apply changes"
        description="This slot is part of a recurring series. Save your edits to every matching slot in the series, or only to this occurrence?"
      />

      <Dialog
        open={inlineEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setInlineEditOpen(false);
            reopenSlotModalAfterInlineEditIfNeeded();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto border-[#1F1109]/[0.12] bg-[#FAF5EB]">
          <DialogHeader>
            <DialogTitle
              className="text-[#1F1109]"
              style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
            >
              Edit slot
            </DialogTitle>
          </DialogHeader>
          {selectedSlotId != null && (
            <EditSlotSection
              key={selectedSlotId}
              id={selectedSlotId}
              embedded
              onUpdate={() => {
                setInlineEditOpen(false);
                reopenSlotModalAfterInlineEditIfNeeded();
                refreshSlots();
              }}
              onRequirePeriodicScopeChoice={(args) =>
                setPeriodicEditPayload({
                  slotId: args.slotId,
                  payload: args.payload,
                })
              }
            />
          )}
        </DialogContent>
      </Dialog>

      <CreateSlotModal
        open={Boolean(draftRange)}
        onOpenChange={handleDraftModalOpenChange}
        isSubmitting={isCreatingSlots}
        onConfirm={handleCreateSlotConfirm}
        hourlyRate={
          user?.hourlyRate != null ? Number(user.hourlyRate) : null
        }
        intervalStartIso={draftRange?.startStr ?? ""}
        intervalEndIso={draftRange?.endStr ?? ""}
      />

      <SlotModal
        visible={modalVisible}
        slotId={selectedSlotId}
        slot={selectedSlot}
        offerSeriesDeleteChoice
        onEditSlot={() => {
          resumeSlotModalAfterInlineEditRef.current = true;
          setModalVisible(false);
          setInlineEditOpen(true);
        }}
        onClose={() => {
          setModalVisible(false);
          setSelectedSlot(null);
        }}
        onDeleted={handleDeleted}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default MasterCalendarView;
