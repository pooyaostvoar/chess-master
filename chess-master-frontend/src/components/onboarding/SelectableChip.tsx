import React from "react";
import { cn } from "../../lib/utils";

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
  "data-analytics"?: string;
}

export const SelectableChip: React.FC<SelectableChipProps> = ({
  label,
  selected,
  onSelect,
  className,
  "data-analytics": dataAnalytics,
}) => (
  <button
    type="button"
    onClick={onSelect}
    data-selected={selected}
    data-analytics={dataAnalytics}
    className={cn(
      "px-4 py-3 rounded-lg text-left font-medium text-sm transition-all",
      "border-2 min-h-[48px] flex items-center",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      selected
        ? "border-primary bg-primary/10 text-primary"
        : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
      className
    )}
  >
    {label}
  </button>
);
