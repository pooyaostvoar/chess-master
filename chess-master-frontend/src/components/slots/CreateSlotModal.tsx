import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

import AdvanceSection from "./create-slot-modal/AdvanceSection";
import BasicSection from "./create-slot-modal/BasicSection";
import RecurringSection from "./create-slot-modal/RecurringSection";
import type {
  CreateSlotConfirmPayload,
  SlotPeriod,
} from "./create-slot-modal/types";

export type { CreateSlotConfirmPayload, SlotPeriod } from "./create-slot-modal/types";

function slotLengthHours(startIso: string, endIso: string): number {
  const a = new Date(startIso);
  const b = new Date(endIso);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  return Math.max(0, (b.getTime() - a.getTime()) / 3_600_000);
}

function formatPriceForInput(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  const rounded = Math.round(n * 100) / 100;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2);
}

interface CreateSlotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onConfirm: (payload: CreateSlotConfirmPayload) => void;
  /** Master’s profile hourly rate (USD/hr); when missing, suggested price is 0. */
  hourlyRate: number | null;
  intervalStartIso: string;
  intervalEndIso: string;
}

const CreateSlotModal: React.FC<CreateSlotModalProps> = ({
  open,
  onOpenChange,
  isSubmitting,
  onConfirm,
  hourlyRate,
  intervalStartIso,
  intervalEndIso,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [priceInput, setPriceInput] = useState("0");
  const [recurring, setRecurring] = useState(false);
  const [period, setPeriod] = useState<SlotPeriod>("daily");
  const [chunkSizeMinutes, setChunkSizeMinutes] = useState(60);
  const [repeatCount, setRepeatCount] = useState(50);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setYoutubeId("");
      setRecurring(false);
      setPeriod("daily");
      setChunkSizeMinutes(60);
      setRepeatCount(50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const hr = hourlyRate ?? 0;
    const slotH = slotLengthHours(intervalStartIso, intervalEndIso);
    const suggested = recurring
      ? hr * (chunkSizeMinutes / 60)
      : hr * slotH;
    setPriceInput(formatPriceForInput(suggested));
  }, [
    open,
    recurring,
    chunkSizeMinutes,
    hourlyRate,
    intervalStartIso,
    intervalEndIso,
  ]);

  const parsePrice = (raw: string): number | null => {
    const t = raw.trim();
    if (t === "" || t === ".") return 0;
    const n = Number(t);
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  };

  const handleConfirm = () => {
    const base = {
      title: title.trim() || null,
      description: description.trim() || null,
      price: parsePrice(priceInput),
      youtubeId: youtubeId.trim() || null,
    };
    if (recurring) {
      const n = Number(repeatCount);
      const chunk = Number(chunkSizeMinutes);
      if (!Number.isInteger(n) || n < 1) {
        return;
      }
      if (!Number.isFinite(chunk) || chunk < 1 || !Number.isInteger(chunk)) {
        return;
      }
      onConfirm({
        recurring: true,
        period,
        repeatCount: n,
        chunkSizeMinutes: chunk,
        ...base,
      });
      return;
    }
    onConfirm({
      recurring: false,
      period: "daily",
      repeatCount: 1,
      ...base,
    });
  };

  const priceInvalid = parsePrice(priceInput) === null;

  const repeatInvalid =
    recurring &&
    (!Number.isInteger(Number(repeatCount)) || Number(repeatCount) < 1);

  const chunkInvalid =
    recurring &&
    (!Number.isFinite(Number(chunkSizeMinutes)) ||
      Number(chunkSizeMinutes) < 1 ||
      !Number.isInteger(Number(chunkSizeMinutes)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto border-[#1F1109]/[0.12] bg-[#FAF5EB] pt-6">
        <DialogHeader className="sr-only">
          <DialogTitle>New availability</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pb-1">
          <BasicSection
            modalOpen={open}
            title={title}
            onTitleChange={setTitle}
            priceInput={priceInput}
            onPriceInputChange={setPriceInput}
            isSubmitting={isSubmitting}
            priceInvalid={priceInvalid}
          />

          <RecurringSection
            modalOpen={open}
            recurring={recurring}
            onRecurringChange={setRecurring}
            isSubmitting={isSubmitting}
            period={period}
            onPeriodChange={setPeriod}
            chunkSizeMinutes={chunkSizeMinutes}
            onChunkSizeMinutesChange={setChunkSizeMinutes}
            repeatCount={repeatCount}
            onRepeatCountChange={setRepeatCount}
          />

          <AdvanceSection
            description={description}
            onDescriptionChange={setDescription}
            youtubeId={youtubeId}
            onYoutubeIdChange={setYoutubeId}
            isSubmitting={isSubmitting}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="border-[#1F1109]/20"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={
              isSubmitting || repeatInvalid || chunkInvalid || priceInvalid
            }
            className="bg-[#B8893D] text-[#1F1109] hover:bg-[#A37728]"
          >
            {isSubmitting ? "Creating…" : "Create slots"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSlotModal;
