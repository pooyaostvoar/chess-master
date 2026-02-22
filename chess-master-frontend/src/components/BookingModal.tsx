import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { CalendarCheck, XCircle, HelpCircle } from "lucide-react";
import { checkoutSlot } from "../services/payment";
import { getSlotById } from "../services/schedule";
import { BookingSummaryCard } from "./booking/BookingSummaryCard";
import { BookingHowItWorks } from "./booking/BookingHowItWorks";

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
  const [slot, setSlot] = useState<any>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (visible && slotId != null) {
      getSlotById(slotId)
        .then(setSlot)
        .catch(() => setSlot(null));
    } else {
      setSlot(null);
    }
  }, [visible, slotId]);

  if (!visible || slotId == null) return null;

  const handleBook = async () => {
    try {
      setLoading(true);
      setMessage(null);

      await checkoutSlot(slotId);

      // nothing after this runs because browser redirects
    } catch (err: any) {
      setLoading(false);
      const errorMsg =
        err?.message && typeof err.message === "string"
          ? err.message
          : "Payment session failed. Please try again.";
      setMessage({
        type: "error",
        text: `❌ ${errorMsg}`,
      });
    }
  };

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm your booking</DialogTitle>
          <DialogDescription>
            Review the details below. After payment, the master will approve your
            request. You&apos;ll receive connection details once approved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Booking summary */}
          {slot && (
            <BookingSummaryCard
              masterName={slot.master?.username || "Master"}
              sessionTitle={slot.title}
              startTime={slot.startTime}
              endTime={slot.endTime}
              price={slot.price}
            />
          )}

          {/* How it works */}
          <BookingHowItWorks />

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleBook}
              disabled={loading || !!message}
              className="w-full h-auto py-4 justify-start"
            >
              <CalendarCheck className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Pay & Request Booking</div>
                <div className="text-sm opacity-80">
                  {loading
                    ? "Redirecting to secure payment..."
                    : "You pay now; master approves before the session"}
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
                <div className="font-semibold">Cancel</div>
                <div className="text-sm opacity-80">Close without booking</div>
              </div>
            </Button>

            {/* Error Message */}
            {message && (
              <div
                className={`text-sm font-medium text-center p-3 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Help link */}
            <p className="text-center text-xs text-muted-foreground">
              <a
                href="mailto:team@chesswithmasters.com"
                className="inline-flex items-center gap-1 hover:text-primary underline-offset-2 hover:underline"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Questions? Contact support
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
