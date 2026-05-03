import React, { useCallback, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

const TOOLTIP_Z = 200;

export interface HoverTooltipPortalProps {
  id: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  open: boolean;
  width?: number;
  /** Rough max height for flip-above logic */
  estimateHeight?: number;
  children: React.ReactNode;
}

/**
 * Fixed-position tooltip anchored to a button; mirrors BasicSection price tooltip behavior.
 */
export function HoverTooltipPortal({
  id,
  anchorRef,
  open,
  width = 288,
  estimateHeight = 120,
  children,
}: HoverTooltipPortalProps) {
  const [style, setStyle] = useState<React.CSSProperties>({});

  const updatePosition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let left = r.left + r.width / 2 - width / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - width - 10));
    const gap = 8;
    const viewportPad = 10;
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
      width,
      top,
      transform,
      zIndex: TOOLTIP_Z,
    });
  }, [anchorRef, estimateHeight, width]);

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
      id={id}
      className="pointer-events-none rounded-md border border-[#1F1109]/10 bg-[#32261C] px-3 py-2.5 text-left text-xs font-normal leading-snug text-[#FAF5EB] shadow-lg"
      style={style}
    >
      {children}
    </div>,
    document.body
  );
}
