import React, { useState } from "react";
import { bookSlot } from "../services/schedule";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
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

      // nothing after this runs because browser redirects
    } catch (err) {
      setLoading(false);

      setMessage({
        type: "error",
        text: "❌ Payment session failed. Please try again.",
      });
    }
  };

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
          <DialogDescription>
            Do you want to book this time slot?
          </DialogDescription>
        </DialogHeader>

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleBook}
            disabled={loading || !!message}
            className="w-full h-auto py-4 justify-start"
          >
            <CalendarCheck className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">Yes, Book This Slot</div>
              <div className="text-sm opacity-80">
                {loading ? "Processing..." : "Confirm your reservation"}
              </div>
            </div>
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading || !!message}
            className="w-full h-auto py-4 justify-start"
          >
            <XCircle className="mr-3 h-5 w-5" />
            <div className="text-left">
              <div className="font-semibold">No, Cancel</div>
              <div className="text-sm opacity-80">Close without booking</div>
            </div>
          </Button>

          {/* ✅ Success / Error Message */}
          {message && (
            <div
              className={`mt-3 text-sm font-medium text-center p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
              <div className="text-xs opacity-70 mt-1">
                Closing automatically...
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
