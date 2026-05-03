import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

import { Label } from "../../ui/label";
import { Input } from "../../ui/input";

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

export interface BasicSectionProps {
  /** When true, resets price tooltip visibility (align with modal open). */
  modalOpen: boolean;
  title: string;
  onTitleChange: (value: string) => void;
  priceInput: string;
  onPriceInputChange: (value: string) => void;
  isSubmitting: boolean;
  priceInvalid: boolean;
}

const BasicSection: React.FC<BasicSectionProps> = ({
  modalOpen,
  title,
  onTitleChange,
  priceInput,
  onPriceInputChange,
  isSubmitting,
  priceInvalid,
}) => {
  const [priceInfoOpen, setPriceInfoOpen] = useState(false);
  const priceInfoAnchorRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (modalOpen) setPriceInfoOpen(false);
  }, [modalOpen]);

  return (
    <>
      <input
        id="create-slot-title"
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
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
            onChange={(e) => onPriceInputChange(e.target.value)}
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
    </>
  );
};

export default BasicSection;
