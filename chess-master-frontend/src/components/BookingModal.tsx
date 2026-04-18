import React, { useState } from "react";
import { bookSlot } from "../services/schedule";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { CalendarCheck, XCircle } from "lucide-react";
import { checkoutSlot } from "../services/payment";

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  slotId: number | null;
  onBooked?: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  onClose,
  slotId,
  onBooked,
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  if (!visible || slotId == null) return null;

  const handleBook = async () => {
    try {
      setLoading(true);
      setMessage(null);
      await checkoutSlot(slotId);
    } catch (err: any) {
      setLoading(false);
      const errorMsg =
        err?.message && typeof err.message === "string"
          ? err.message
          : "Payment session failed. Please try again.";
      setMessage({ type: "error", text: errorMsg });
    }
  };

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#FAF5EB] border-[#1F1109]/[0.12]">
        <DialogHeader>
          <DialogTitle className="text-[#1F1109]" style={{ fontFamily: "Georgia, serif" }}>
            Confirm booking
          </DialogTitle>
          <DialogDescription className="text-[#6B5640]">
            Do you want to book this time slot?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5 mt-4">
          <button
            onClick={handleBook}
            disabled={loading || !!message}
            className="w-full flex items-center gap-3 p-4 rounded-lg bg-[#B8893D] text-[#1F1109] hover:bg-[#A37728] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CalendarCheck className="h-5 w-5 flex-shrink-0" />
            <div className="text-left">
              <div className="text-sm font-medium">Yes, book this slot</div>
              <div className="text-xs opacity-70">
                {loading ? "Processing..." : "Confirm your reservation"}
              </div>
            </div>
          </button>

          <button
            onClick={onClose}
            disabled={loading || !!message}
            className="w-full flex items-center gap-3 p-4 rounded-lg border border-[#1F1109]/[0.12] text-[#3D2817] hover:bg-[#1F1109]/[0.04] transition-colors disabled:opacity-50"
          >
            <XCircle className="h-5 w-5 flex-shrink-0 text-[#8B6F4E]" />
            <div className="text-left">
              <div className="text-sm font-medium">No, cancel</div>
              <div className="text-xs text-[#6B5640]">Close without booking</div>
            </div>
          </button>

          {message && (
            <div
              className={`mt-2 text-[13px] font-medium text-center p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-[#B8893D]/10 text-[#6B4F1F]"
                  : "bg-[#7A2E2E]/10 text-[#7A2E2E]"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
