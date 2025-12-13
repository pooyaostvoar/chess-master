import React from "react";
import { deleteSlots, updateSlotStatus } from "../services/schedule";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
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

  const isReserved = slot?.status === "reserved";
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

  const handleApprove = () => {
    updateStatus("booked");
  };

  const handleReject = () => {
    if (
      !window.confirm(
        `Reject the request from ${
          reservedBy?.username || "this user"
        }? The slot will become available again.`
      )
    ) {
      return;
    }
    updateStatus("free");
  };

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isReserved ? "Slot Request" : "Manage Time Slot"}
          </DialogTitle>
          <DialogDescription>
            {isReserved
              ? "Approve or reject this request"
              : "Choose an action for this time slot"}
          </DialogDescription>
        </DialogHeader>

        {isReserved && reservedBy && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {reservedBy.username} has requested this time slot
              </CardTitle>
              {reservedBy.email && (
                <CardDescription className="text-sm">
                  {reservedBy.email}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        )}

        <div className="flex flex-col gap-3 mt-4">
          {isReserved ? (
            <>
              <Button
                onClick={handleApprove}
                className="w-full h-auto py-4 justify-start"
                variant="default"
              >
                <CheckCircle2 className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Approve Request</div>
                  <div className="text-sm opacity-80">Confirm the booking</div>
                </div>
              </Button>

              <Button
                onClick={handleReject}
                className="w-full h-auto py-4 justify-start"
                variant="destructive"
              >
                <XCircle className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Reject Request</div>
                  <div className="text-sm opacity-80">
                    Make slot available again
                  </div>
                </div>
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => updateStatus("free")}
                className="w-full h-auto py-4 justify-start"
                variant="outline"
              >
                <Circle className="mr-3 h-5 w-5 text-green-500 fill-green-500" />
                <div className="text-left">
                  <div className="font-semibold">Set as Available</div>
                  <div className="text-sm opacity-80">Open for booking</div>
                </div>
              </Button>

              <Button
                onClick={() => updateStatus("reserved")}
                className="w-full h-auto py-4 justify-start"
                variant="outline"
              >
                <Circle className="mr-3 h-5 w-5 text-yellow-500 fill-yellow-500" />
                <div className="text-left">
                  <div className="font-semibold">Mark as Reserved</div>
                  <div className="text-sm opacity-80">Pending confirmation</div>
                </div>
              </Button>

              <Button
                onClick={() => updateStatus("booked")}
                className="w-full h-auto py-4 justify-start"
                variant="outline"
              >
                <Circle className="mr-3 h-5 w-5 text-red-500 fill-red-500" />
                <div className="text-left">
                  <div className="font-semibold">Mark as Booked</div>
                  <div className="text-sm opacity-80">Confirmed session</div>
                </div>
              </Button>
              <Button
                onClick={() => navigate(`/events/${slotId}/edit`)}
                className="w-full h-auto py-4 justify-start"
                variant="outline"
              >
                <Pencil className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Edit Slot</div>
                  <div className="text-sm opacity-80">
                    Update time, title, or video
                  </div>
                </div>
              </Button>
              <Button
                onClick={handleDelete}
                className="w-full h-auto py-4 justify-start"
                variant="destructive"
              >
                <Trash2 className="mr-3 h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Delete Slot</div>
                  <div className="text-sm opacity-80">Remove permanently</div>
                </div>
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SlotModal;
