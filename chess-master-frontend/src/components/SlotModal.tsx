import React from "react";
import { deleteSlots, updateSlotStatus } from "../services/schedule";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { CheckCircle2, XCircle, Trash2, Circle, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SlotModalProps {
  visible: boolean;
  onClose: () => void;
  slotId: number | null;
  slot?: any;
  onDeleted?: (id: number) => void;
  onStatusChange?: (slot: any) => void;
}

const SlotModal: React.FC<SlotModalProps> = ({
  visible,
  onClose,
  slotId,
  slot,
  onDeleted,
  onStatusChange,
}) => {
  const navigate = useNavigate();
  if (!visible || slotId == null) return null;

  const isReserved = slot?.status === "paid";
  const reservedBy =
    slot?.extendedProps?.fullSlot?.reservedBy || slot?.reservedBy;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
      await deleteSlots([slotId]);
      onDeleted?.(slotId);
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
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#FAF5EB] border-[#1F1109]/[0.12]">
        <DialogHeader>
          <DialogTitle className="text-[#1F1109]" style={{ fontFamily: "Georgia, serif" }}>
            {isReserved ? "Slot request" : "Manage time slot"}
          </DialogTitle>
          <DialogDescription className="text-[#6B5640]">
            {isReserved
              ? "Approve or reject this request"
              : "Choose an action for this time slot"}
          </DialogDescription>
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
              <button onClick={() => navigate(`/events/${slotId}/edit`)} className={actionBtnClass}>
                <Pencil className="h-5 w-5 text-[#8B6F4E] flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">Edit slot</div>
                  <div className="text-xs text-[#6B5640]">Update time, title, or video</div>
                </div>
              </button>
              <button onClick={handleDelete} className="w-full flex items-center gap-3 p-4 rounded-lg bg-[#7A2E2E]/10 text-[#7A2E2E] hover:bg-[#7A2E2E]/20 transition-colors">
                <Trash2 className="h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium">Delete slot</div>
                  <div className="text-xs opacity-70">Remove permanently</div>
                </div>
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SlotModal;
