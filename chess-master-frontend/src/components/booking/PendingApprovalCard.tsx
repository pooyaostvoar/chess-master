import React from "react";
import { Clock, MessageCircle, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { ConnectionDetailsExpectations } from "./ConnectionDetailsExpectations";

interface PendingApprovalCardProps {
  masterName: string;
  startTime: string;
  endTime: string;
  onViewMessages: () => void;
  onBrowseMasters: () => void;
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

export const PendingApprovalCard: React.FC<PendingApprovalCardProps> = ({
  masterName,
  startTime,
  endTime,
  onViewMessages,
  onBrowseMasters,
}) => (
  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-4">
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-primary" />
      <BookingStatusBadge status="paid" />
    </div>
    <p className="text-sm text-muted-foreground">
      Your request has been sent to <span className="font-medium text-foreground">{masterName}</span>.
      We&apos;ll notify you once they approve.
    </p>
    <p className="text-sm font-medium">{formatDate(startTime)}</p>
    <ConnectionDetailsExpectations />
    <div className="flex flex-wrap gap-2">
      <Button size="sm" onClick={onViewMessages}>
        <MessageCircle className="mr-2 h-4 w-4" />
        View messages
      </Button>
      <Button size="sm" variant="outline" onClick={onBrowseMasters}>
        Browse masters
      </Button>
    </div>
  </div>
);
