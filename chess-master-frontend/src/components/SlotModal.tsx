import React, { useEffect, useRef, useState } from "react";
import { deleteSlots, updateSlotStatus } from "../services/schedule";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { CheckCircle2, XCircle, Trash2, Circle, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  slotIsPeriodicSeriesChunk,
  slotStatusCalendarColor,
} from "../utils/slotUtils";
import type { PeriodicSlotConfigSummary } from "../services/api/schedule.api";
import { cn } from "../lib/utils";
import DeleteRecurringSlotModal from "./slots/DeleteRecurringSlotModal";

/** Date + time on one line (Google Calendar–style). */
function formatSlotDateAndTimeOneLine(
  startRaw: string | Date | undefined,
  endRaw: string | Date | undefined
): string | null {
  if (startRaw == null || endRaw == null) return null;
  const start = new Date(startRaw);
  const end = new Date(endRaw);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const dateLine = start.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeFmt: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  let timeLine: string;
  if (start.toDateString() === end.toDateString()) {
    timeLine = `${start.toLocaleTimeString(undefined, timeFmt)} – ${end.toLocaleTimeString(undefined, timeFmt)}`;
  } else {
    timeLine = `${start.toLocaleString(undefined, { ...timeFmt, month: "short", day: "numeric" })} – ${end.toLocaleString(undefined, { ...timeFmt, month: "short", day: "numeric" })}`;
  }
  return `${dateLine} · ${timeLine}`;
}

/** Short recurrence label from `periodicSlotConfig`, or null if not recurring. */
function formatPeriodicPeriodLine(fullSlot: any): string | null {
  const cfg = fullSlot?.periodicSlotConfig as PeriodicSlotConfigSummary | null | undefined;
  if (!cfg) return null;
  switch (cfg.period) {
    case "daily":
      return "Daily event";
    case "weekly":
      return "Weekly event";
    case "monthly":
      return "Monthly event";
    default:
      return "Recurring event";
  }
}

/** Title line aligned with calendar labeling (master view). */
function slotModalDisplayTitle(fullSlot: any, isMasterView = true): string {
  if (!fullSlot) return "Time slot";
  if (fullSlot.status === "free") {
    const base =
      (fullSlot.title && String(fullSlot.title).trim()) || "Available";
    if (fullSlot?.price != null && fullSlot.price !== "") {
      return `${base} · $${fullSlot.price}`;
    }
    return base;
  }
  const t = fullSlot?.title && String(fullSlot.title).trim();
  if (t) return t;
  if (isMasterView && fullSlot?.status === "reserved" && fullSlot?.reservedBy?.username) {
    return `Request from ${fullSlot.reservedBy.username}`;
  }
  if (isMasterView && fullSlot?.status === "paid" && fullSlot?.reservedBy?.username) {
    return `Pending: ${fullSlot.reservedBy.username}`;
  }
  switch (fullSlot?.status) {
    case "reserved":
      return "Reserved";
    case "paid":
      return "Payment received";
    case "booked":
      return "Booked";
    default:
      return "Time slot";
  }
}

function SlotModalEventSummary({
  fullSlot,
  statusColor,
  headerRight,
}: {
  fullSlot: any;
  statusColor: string;
  headerRight?: React.ReactNode;
}) {
  const whenLine = formatSlotDateAndTimeOneLine(
    fullSlot?.startTime,
    fullSlot?.endTime
  );
  const periodLine = formatPeriodicPeriodLine(fullSlot);
  const displayTitle = slotModalDisplayTitle(fullSlot, true);
  const displayDescription =
    typeof fullSlot?.description === "string" && fullSlot.description.trim()
      ? fullSlot.description.trim()
      : "";

  return (
    <div className="flex min-h-[3rem] gap-3">
      <div
        className="w-1 shrink-0 self-stretch rounded-sm"
        style={{ backgroundColor: statusColor }}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-row items-start justify-between gap-2">
          <DialogTitle
            className="min-w-0 flex-1 pr-2 text-left text-lg font-semibold leading-snug text-[#1F1109]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {displayTitle}
          </DialogTitle>
          {headerRight ? (
            <div className="flex shrink-0 items-center gap-0.5 pt-0.5">
              {headerRight}
            </div>
          ) : null}
        </div>
        {whenLine ? (
          <p className="text-sm text-[#6B5640]">{whenLine}</p>
        ) : (
          <p className="text-sm text-[#6B5640]">Time not available</p>
        )}
        {periodLine ? (
          <p className="text-sm text-[#6B5640]">{periodLine}</p>
        ) : null}
        {displayDescription ? (
          <p className="pt-1 text-sm leading-relaxed text-[#5C4A3A]">
            {displayDescription}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function HeaderIconButton({
  label,
  onClick,
  children,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  variant?: "default" | "danger";
}) {
  return (
    <div className="group relative flex">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8893D]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF5EB]",
          variant === "danger"
            ? "text-[#8B4343] hover:bg-[#7A2E2E]/12"
            : "text-[#5C4A3A] hover:bg-[#1F1109]/10"
        )}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-[60] mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#32261C] px-2 py-1 text-xs font-medium text-[#FAF5EB] opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}

interface SlotModalProps {
  visible: boolean;
  onClose: () => void;
  slotId: number | null;
  slot?: any;
  /** When true and slot is from a recurring batch, deleting asks “this only” vs “all in series”. */
  offerSeriesDeleteChoice?: boolean;
  /** When set, “Edit slot” opens this instead of navigating to /events/:id/edit */
  onEditSlot?: () => void;
  onDeleted?: (deletedIds: number[]) => void;
  onStatusChange?: (slot: any) => void;
}

const SlotModal: React.FC<SlotModalProps> = ({
  visible,
  onClose,
  slotId,
  slot,
  offerSeriesDeleteChoice = false,
  onEditSlot,
  onDeleted,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  const [seriesDeleteOpen, setSeriesDeleteOpen] = useState(false);
  const seriesDeleteOpenRef = useRef(false);
  seriesDeleteOpenRef.current = seriesDeleteOpen;

  useEffect(() => {
    if (!visible) setSeriesDeleteOpen(false);
  }, [visible]);

  if (!visible || slotId == null) return null;

  const fullSlot =
    slot?.extendedProps?.fullSlot ?? slot ?? undefined;
  const statusColor = slotStatusCalendarColor(fullSlot?.status);
  const isReserved = fullSlot?.status === "paid";
  const isFree = fullSlot?.status === "free";
  const reservedBy =
    fullSlot?.reservedBy ||
    slot?.extendedProps?.fullSlot?.reservedBy ||
    slot?.reservedBy;

  const showSeriesDeleteStep =
    offerSeriesDeleteChoice && slotIsPeriodicSeriesChunk(fullSlot);

  const handleDeleteClick = () => {
    if (showSeriesDeleteStep) {
      seriesDeleteOpenRef.current = true;
      setSeriesDeleteOpen(true);
      return;
    }
    void confirmDeleteSingle();
  };

  const confirmDeleteSingle = async () => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      await deleteSlots([slotId]);
      onDeleted?.([slotId]);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error deleting slot. Please try again.");
    }
  };

  const updateStatus = async (status: "free" | "reserved" | "booked") => {
    try {
      const res = await updateSlotStatus(slotId, status);
      onStatusChange?.(res.slot);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error updating status. Please try again.");
    }
  };

  const handleApprove = () => updateStatus("booked");

  const handleReject = () => {
    if (
      !window.confirm(
        `Reject the request from ${reservedBy?.username || "this user"}? The slot will become available again.`
      )
    )
      return;
    updateStatus("free");
  };

  const actionBtnClass =
    "w-full flex items-center gap-3 p-4 rounded-lg border border-[#1F1109]/[0.12] text-[#3D2817] hover:bg-[#1F1109]/[0.04] transition-colors text-left";

  return (
    <>
      <DeleteRecurringSlotModal
        open={seriesDeleteOpen}
        onOpenChange={setSeriesDeleteOpen}
        slotId={slotId}
        onDeleted={(ids) => {
          onDeleted?.(ids);
          onClose();
        }}
      />
      <Dialog
        open={visible && !seriesDeleteOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Main content is unmounted while recurring delete is open; don’t end the whole flow.
            if (seriesDeleteOpenRef.current) return;
            onClose();
          }
        }}
      >
      <DialogContent className="sm:max-w-[500px] bg-[#FAF5EB] border-[#1F1109]/[0.12]">
        <DialogHeader
          className={cn(
            "space-y-0 border-b border-[#1F1109]/[0.08] pb-4 text-left",
            isFree ? "pr-10 sm:pr-11" : "pr-10"
          )}
        >
          <SlotModalEventSummary
            fullSlot={fullSlot}
            statusColor={statusColor}
            headerRight={
              isFree ? (
                <>
                  <HeaderIconButton
                    label="Edit"
                    onClick={() =>
                      onEditSlot ? onEditSlot() : navigate(`/events/${slotId}/edit`)
                    }
                  >
                    <Pencil className="h-[18px] w-[18px]" strokeWidth={2} />
                  </HeaderIconButton>
                  <HeaderIconButton
                    label="Delete"
                    variant="danger"
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-[18px] w-[18px]" strokeWidth={2} />
                  </HeaderIconButton>
                </>
              ) : undefined
            }
          />
        </DialogHeader>

        {isReserved && reservedBy && (
          <div className="border border-[#B8893D]/30 bg-[#B8893D]/10 rounded-lg p-3.5">
            <p className="text-sm font-medium text-[#1F1109]">
              {reservedBy.username} has requested this time slot
            </p>
            {reservedBy.email && (
              <p className="text-xs text-[#6B5640] mt-0.5">{reservedBy.email}</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5 mt-4">
          {isReserved ? (
            <>
              <button onClick={handleApprove} className="w-full flex items-center gap-3 p-4 rounded-lg bg-[#B8893D] text-[#1F1109] hover:bg-[#A37728] transition-colors">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">Approve request</div>
                  <div className="text-xs opacity-70">Confirm the booking</div>
                </div>
              </button>
              <button onClick={handleReject} className="w-full flex items-center gap-3 p-4 rounded-lg bg-[#7A2E2E]/10 text-[#7A2E2E] hover:bg-[#7A2E2E]/20 transition-colors">
                <XCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">Reject request</div>
                  <div className="text-xs opacity-70">Make slot available again</div>
                </div>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => updateStatus("free")} className={actionBtnClass}>
                <Circle className="h-5 w-5 text-[#B8893D] fill-[#B8893D] flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">Set as available</div>
                  <div className="text-xs text-[#6B5640]">Open for booking</div>
                </div>
              </button>
              <button onClick={() => updateStatus("reserved")} className={actionBtnClass}>
                <Circle className="h-5 w-5 text-[#8B6F4E] fill-[#8B6F4E] flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">Mark as reserved</div>
                  <div className="text-xs text-[#6B5640]">Pending confirmation</div>
                </div>
              </button>
              <button onClick={() => updateStatus("booked")} className={actionBtnClass}>
                <Circle className="h-5 w-5 text-[#3D2817] fill-[#3D2817] flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">Mark as booked</div>
                  <div className="text-xs text-[#6B5640]">Confirmed session</div>
                </div>
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default SlotModal;
