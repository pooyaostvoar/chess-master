import React from "react";
import { cn } from "../../lib/utils";

type Status = "free" | "reserved" | "paid" | "booked";

const STATUS_CONFIG: Record<
  Status,
  { label: string; className: string }
> = {
  free: { label: "Available", className: "bg-muted text-muted-foreground" },
  reserved: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  paid: {
    label: "Pending approval",
    className: "bg-primary/10 text-primary border border-primary/20",
  },
  booked: {
    label: "Confirmed",
    className: "bg-green-100 text-green-800 border border-green-200",
  },
};

interface BookingStatusBadgeProps {
  status: string;
  className?: string;
}

export const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  className,
}) => {
  const config =
    STATUS_CONFIG[status as Status] ?? {
      label: status,
      className: "bg-muted text-muted-foreground",
    };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};
