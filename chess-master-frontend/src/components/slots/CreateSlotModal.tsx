import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Info } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { cn } from "../../lib/utils";

export type SlotPeriod = "daily" | "weekly" | "monthly";

export interface CreateSlotConfirmPayload {
  recurring: boolean;
  period: SlotPeriod;
  repeatCount: number;
  /** Minutes per slot when splitting the selected range (recurring only). Default 60. */
  chunkSizeMinutes?: number;
  title: string | null;
  description: string | null;
  price: number | null;
  youtubeId: string | null;
}

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

const PRICE_INFO =
  "Suggested from your hourly rate. One-time: rate × the length of the time you selected. Recurring: rate × chunk size — that price applies to each chunk (each slot created in the series).";

const TOOLTIP_WIDTH = 288;
const TOOLTIP_Z = 200;

function PriceInfoTooltipPortal({
  anchorRef,
  open,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
}) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let left = r.left + r.width / 2 - TOOLTIP_WIDTH / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - TOOLTIP_WIDTH - 10));
    const gap = 8;
    const viewportPad = 10;
    const estimateHeight = 140;
    let top = r.bottom + gap;
    let transform: string | undefined;
    if (
      top + estimateHeight > window.innerHeight - viewportPad &&
      r.top > estimateHeight + gap
    ) {
      top = r.top - gap;
      transform = "translateY(-100%)";
    }
    setStyle({
      position: "fixed",
      left,
      width: TOOLTIP_WIDTH,
      top,
      transform,
      zIndex: TOOLTIP_Z,
    });
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="tooltip"
      id="create-slot-price-tooltip"
      className="pointer-events-none rounded-md border border-[#1F1109]/10 bg-[#32261C] px-3 py-2.5 text-left text-xs font-normal leading-snug text-[#FAF5EB] shadow-lg"
      style={style}
    >
      {PRICE_INFO}
    </div>,
    document.body
  );
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
  const [priceInfoOpen, setPriceInfoOpen] = useState(false);
  const priceInfoAnchorRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setYoutubeId("");
      setRecurring(false);
      setPeriod("daily");
      setChunkSizeMinutes(60);
      setRepeatCount(50);
      setPriceInfoOpen(false);
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
          <input
            id="create-slot-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add title"
            disabled={isSubmitting}
            className="w-full border-0 border-b border-[#1F1109]/15 bg-transparent px-0 py-2 text-xl text-[#1F1109] placeholder:text-[#6B5640] focus:border-[#B8893D] focus:outline-none focus:ring-0"
            style={{ fontFamily: "Georgia, serif" }}
            autoFocus
            aria-label="Title"
          />

          <div className="flex flex-row flex-wrap items-center gap-3">
            <div className="flex shrink-0 items-center gap-1.5">
              <Label
                htmlFor="create-slot-price"
                className="text-sm text-[#5C4A3A]"
              >
                Price
              </Label>
              <div className="relative flex items-center">
                <button
                  ref={priceInfoAnchorRef}
                  type="button"
                  className="rounded-full p-1 text-[#6B5640] transition-colors hover:bg-[#1F1109]/8 hover:text-[#3D2817] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8893D]/50"
                  aria-label="How price is calculated"
                  aria-describedby={
                    priceInfoOpen ? "create-slot-price-tooltip" : undefined
                  }
                  disabled={isSubmitting}
                  onMouseEnter={() => setPriceInfoOpen(true)}
                  onMouseLeave={() => setPriceInfoOpen(false)}
                  onFocus={() => setPriceInfoOpen(true)}
                  onBlur={() => setPriceInfoOpen(false)}
                >
                  <Info className="h-4 w-4" strokeWidth={2} />
                </button>
                <PriceInfoTooltipPortal
                  anchorRef={priceInfoAnchorRef}
                  open={priceInfoOpen && !isSubmitting}
                />
              </div>
            </div>
            <div className="relative min-w-[7rem] flex-1 max-w-[220px]">
              <span
                className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm text-[#6B5640]"
                aria-hidden
              >
                $
              </span>
              <Input
                id="create-slot-price"
                type="text"
                inputMode="decimal"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                disabled={isSubmitting}
                className="border-[#1F1109]/20 bg-white pl-8"
                aria-describedby={
                  priceInvalid ? "create-slot-price-error" : undefined
                }
              />
            </div>
            {priceInvalid && (
              <p
                id="create-slot-price-error"
                className="basis-full text-xs text-[#7A2E2E]"
              >
                Enter a valid non-negative amount.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <span className="text-sm text-[#5C4A3A]">Type</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-2 text-sm text-[#3D2817]"
                )}
              >
                <input
                  type="radio"
                  name="slot-recurring"
                  checked={!recurring}
                  onChange={() => setRecurring(false)}
                  disabled={isSubmitting}
                  className="accent-[#B8893D]"
                />
                One-time (single slot)
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3D2817]">
                <input
                  type="radio"
                  name="slot-recurring"
                  checked={recurring}
                  onChange={() => setRecurring(true)}
                  disabled={isSubmitting}
                  className="accent-[#B8893D]"
                  aria-describedby="recurring-price-hint"
                />
                Recurring
              </label>
            </div>
            <p id="recurring-price-hint" className="sr-only">
              When recurring is selected, the price field applies to each chunk
              in the series.
            </p>
          </div>

          {recurring && (
            <div className="space-y-3 rounded-lg border border-[#1F1109]/10 bg-white/60 p-3">
              <div className="space-y-1.5">
                <Label htmlFor="slot-period">Repeat</Label>
                <select
                  id="slot-period"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as SlotPeriod)}
                  disabled={isSubmitting}
                  className="flex h-10 w-full rounded-md border border-[#1F1109]/20 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8893D]/40"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slot-chunk-minutes">Chunk size (minutes)</Label>
                <Input
                  id="slot-chunk-minutes"
                  type="number"
                  min={1}
                  step={1}
                  value={chunkSizeMinutes}
                  onChange={(e) => setChunkSizeMinutes(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="border-[#1F1109]/20 bg-white"
                />
                <p className="text-xs text-[#6B5640]">
                  Each slot in the range lasts this long (default 60).
                </p>
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
                  className="border-[#1F1109]/20 bg-white"
                />
                <p className="text-xs text-[#6B5640]">
                  Each occurrence repeats the same time window (split into slots by
                  duration).
                </p>
              </div>
            </div>
          )}

          <details className="group rounded-lg border border-[#1F1109]/10 bg-white/50 open:bg-white/80">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-[#3D2817] marker:content-none [&::-webkit-details-marker]:hidden">
              <span>Advanced</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[#6B5640] transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="space-y-4 border-t border-[#1F1109]/08 px-3 pb-3 pt-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-slot-description">Description</Label>
                <Textarea
                  id="create-slot-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details for students"
                  disabled={isSubmitting}
                  className="min-h-[88px] border-[#1F1109]/20 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-slot-youtube">YouTube video ID</Label>
                <Input
                  id="create-slot-youtube"
                  value={youtubeId}
                  onChange={(e) => setYoutubeId(e.target.value)}
                  placeholder="e.g. dQw4w9WgXcQ"
                  disabled={isSubmitting}
                  className="border-[#1F1109]/20 bg-white"
                />
              </div>
            </div>
          </details>
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
