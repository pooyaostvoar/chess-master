import React from "react";
import { Calendar, Clock, DollarSign, User } from "lucide-react";

interface BookingSummaryCardProps {
  masterName: string;
  sessionTitle?: string | null;
  startTime: string;
  endTime: string;
  price?: number | null;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getDuration = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const mins = Math.round((e.getTime() - s.getTime()) / 60000);
  return mins >= 60 ? `${mins / 60} hr` : `${mins} min`;
};

export const BookingSummaryCard: React.FC<BookingSummaryCardProps> = ({
  masterName,
  sessionTitle,
  startTime,
  endTime,
  price,
}) => (
  <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
    <div className="flex items-center gap-2 text-sm">
      <User className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium">{masterName}</span>
    </div>
    {sessionTitle && (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{sessionTitle}</span>
      </div>
    )}
    <div className="flex items-center gap-2 text-sm">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <span>{formatDate(startTime)}</span>
    </div>
    <div className="flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <span>
        {formatTime(startTime)} – {formatTime(endTime)} ({getDuration(startTime, endTime)})
      </span>
    </div>
    {price != null && (
      <div className="flex items-center gap-2 text-sm font-semibold">
        <DollarSign className="h-4 w-4 text-primary" />
        <span>${price.toFixed(2)}</span>
      </div>
    )}
  </div>
);
