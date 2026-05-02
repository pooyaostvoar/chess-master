import React from "react";
import { deleteSlots, deleteBatchSlots } from "../../services/schedule";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Trash2 } from "lucide-react";

const actionBtnClass =
  "w-full flex items-center gap-3 p-4 rounded-lg border border-[#1F1109]/[0.12] text-[#3D2817] hover:bg-[#1F1109]/[0.04] transition-colors text-left";

export interface DeleteRecurringSlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slotId: number;
  onDeleted?: (deletedIds: number[]) => void;
}

/**
 * Shown when deleting a slot that belongs to a recurring series: choose one occurrence vs whole chunk.
 */
const DeleteRecurringSlotModal: React.FC<DeleteRecurringSlotModalProps> = ({
  open,
  onOpenChange,
  slotId,
  onDeleted,
}) => {
  const handleDeleteThisOccurrenceOnly = async () => {
    try {
      await deleteSlots([slotId]);
      onDeleted?.([slotId]);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert("Error deleting slot. Please try again.");
    }
  };

  const handleDeleteAllInSeries = async () => {
    try {
      const res = await deleteBatchSlots(slotId);
      onDeleted?.(res.deletedIds);
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert("Error deleting slots. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#FAF5EB] border-[#1F1109]/[0.12]">
        <DialogHeader className="pr-10 text-left">
          <DialogTitle
            className="text-[#1F1109]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Delete slot
          </DialogTitle>
          <DialogDescription className="text-[#6B5640]">
            This slot is part of a recurring series. Delete only this occurrence,
            or every matching slot in the series (same time window across repeats).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          <button
            type="button"
            onClick={handleDeleteThisOccurrenceOnly}
            className={actionBtnClass}
          >
            <Trash2 className="h-5 w-5 text-[#8B6F4E] flex-shrink-0" />
            <div>
              <div className="text-sm font-medium">Only this slot</div>
              <div className="text-xs text-[#6B5640]">Remove this date only</div>
            </div>
          </button>
          <button
            type="button"
            onClick={handleDeleteAllInSeries}
            className="w-full flex items-center gap-3 p-4 rounded-lg bg-[#7A2E2E]/10 text-[#7A2E2E] hover:bg-[#7A2E2E]/20 transition-colors text-left"
          >
            <Trash2 className="h-5 w-5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium">All events in series</div>
              <div className="text-xs opacity-70">
                Delete every occurrence for this time chunk
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full py-2 text-sm text-[#6B5640] hover:text-[#1F1109]"
          >
            Back
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRecurringSlotModal;
