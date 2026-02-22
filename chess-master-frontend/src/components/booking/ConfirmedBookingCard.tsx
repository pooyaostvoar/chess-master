import React from "react";
import { CheckCircle2, MessageCircle, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { ConnectionDetailsExpectations } from "./ConnectionDetailsExpectations";

interface ConfirmedBookingCardProps {
  masterName: string;
  startTime: string;
  endTime: string;
  sessionTitle?: string | null;
  onOpenChat: () => void;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const ConfirmedBookingCard: React.FC<ConfirmedBookingCardProps> = ({
  masterName,
  startTime,
  endTime,
  sessionTitle,
  onOpenChat,
}) => (
  <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 space-y-4">
    <div className="flex items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <BookingStatusBadge status="booked" />
    </div>
    <div>
      <p className="text-sm font-medium">{formatDate(startTime)}</p>
      {sessionTitle && (
        <p className="text-sm text-muted-foreground">{sessionTitle}</p>
      )}
    </div>
    <ConnectionDetailsExpectations />
    <Button size="sm" onClick={onOpenChat}>
      <MessageCircle className="mr-2 h-4 w-4" />
      Open chat to coordinate
    </Button>
  </div>
);
