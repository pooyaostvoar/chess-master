import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export type SlotPeriod = "daily" | "weekly" | "monthly";

export interface CreateSlotDraftConfirmPayload {
  recurring: boolean;
  period: SlotPeriod;
  repeatCount: number;
}

interface CreateSlotDraftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intervalStartIso: string;
  intervalEndIso: string;
  isSubmitting: boolean;
  onConfirm: (payload: CreateSlotDraftConfirmPayload) => void;
}

function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "";
  }
  const opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };
  return `${start.toLocaleString(undefined, opts)} — ${end.toLocaleString(undefined, opts)}`;
}

const CreateSlotDraftModal: React.FC<CreateSlotDraftModalProps> = ({
  open,
  onOpenChange,
  intervalStartIso,
  intervalEndIso,
  isSubmitting,
  onConfirm,
}) => {
  const [recurring, setRecurring] = useState(false);
  const [period, setPeriod] = useState<SlotPeriod>("daily");
  const [repeatCount, setRepeatCount] = useState(50);

  useEffect(() => {
    if (open) {
      setRecurring(false);
      setPeriod("daily");
      setRepeatCount(50);
    }
  }, [open]);

  const handleConfirm = () => {
    if (recurring) {
      const n = Number(repeatCount);
      if (!Number.isInteger(n) || n < 1) {
        return;
      }
      onConfirm({ recurring: true, period, repeatCount: n });
    } else {
      onConfirm({ recurring: false, period: "daily", repeatCount: 1 });
    }
  };

  const repeatInvalid =
    recurring &&
    (!Number.isInteger(Number(repeatCount)) ||
      Number(repeatCount) < 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>New availability</DialogTitle>
          <DialogDescription>
            {formatRange(intervalStartIso, intervalEndIso) ||
              "Confirm how this time window should be added to your schedule."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="slot-recurring"
                  checked={!recurring}
                  onChange={() => setRecurring(false)}
                  disabled={isSubmitting}
                  className="accent-[#1F1109]"
                />
                One-time (single slot)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="slot-recurring"
                  checked={recurring}
                  onChange={() => setRecurring(true)}
                  disabled={isSubmitting}
                  className="accent-[#1F1109]"
                />
                Recurring
              </label>
            </div>
          </div>

          {recurring && (
            <div className="space-y-3 rounded-lg border border-[#1F1109]/10 bg-[#FAF5EB]/80 p-3">
              <div className="space-y-1.5">
                <Label htmlFor="slot-period">Repeat</Label>
                <select
                  id="slot-period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as SlotPeriod)}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slot-repeat-count">Number of occurrences</Label>
                <Input
                  id="slot-repeat-count"
                  type="number"
                  min={1}
                  step={1}
                  value={repeatCount}
                  onChange={(e) => setRepeatCount(Number(e.target.value))}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Each occurrence repeats the same time window (split into slots by
                  duration).
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || repeatInvalid}
          >
            {isSubmitting ? "Creating…" : "Create slots"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSlotDraftModal;
