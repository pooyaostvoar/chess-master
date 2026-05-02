import React from "react";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

export interface PeriodicSeriesMoveModalProps {
  open: boolean;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateAll: () => void | Promise<void>;
  onUpdateThis: () => void | Promise<void>;
  /** Override default title (e.g. form save vs drag-resize) */
  heading?: string;
  /** Override default body copy */
  description?: string;
}

/**
 * Choose whether a change applies to the whole recurring series or one occurrence.
 */
const PeriodicSeriesMoveModal: React.FC<PeriodicSeriesMoveModalProps> = ({
  open,
  isSubmitting,
  onOpenChange,
  onUpdateAll,
  onUpdateThis,
  heading = "Recurring slot",
  description = `This slot is part of a recurring series. Apply your new time to the whole series (same shift for every matching slot), or only to this occurrence?`,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-md border-[#1F1109]/15 bg-[#FAF5EB]",
          isSubmitting &&
            "[&>button.absolute]:pointer-events-none [&>button.absolute]:opacity-0"
        )}
        onPointerDownOutside={(e) => isSubmitting && e.preventDefault()}
        onEscapeKeyDown={(e) => isSubmitting && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle
            className="text-[#1F1109]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            {heading}
          </DialogTitle>
          <DialogDescription className="text-[#5C4631] text-left">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-2 sm:space-x-0">
          <Button
            type="button"
            className="w-full bg-[#1F1109] text-[#FAF5EB] hover:bg-[#1F1109]/90"
            disabled={isSubmitting}
            onClick={() => void onUpdateAll()}
          >
            {isSubmitting ? "Updating…" : "Update all in series"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full border-[#1F1109]/25"
            disabled={isSubmitting}
            onClick={() => void onUpdateThis()}
          >
            Update this slot only
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-[#5C4631]"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PeriodicSeriesMoveModal;
