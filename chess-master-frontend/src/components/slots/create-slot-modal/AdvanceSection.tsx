import React from "react";
import { ChevronDown } from "lucide-react";

import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { cn } from "../../../lib/utils";
import { createSlotFieldClass } from "./fieldStyles";

export interface AdvanceSectionProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  youtubeId: string;
  onYoutubeIdChange: (value: string) => void;
  isSubmitting: boolean;
}

const AdvanceSection: React.FC<AdvanceSectionProps> = ({
  description,
  onDescriptionChange,
  youtubeId,
  onYoutubeIdChange,
  isSubmitting,
}) => (
  <details className="group rounded-xl border border-[#1F1109]/[0.1] bg-[#F4ECDD]/40 open:bg-[#F4ECDD]/55">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-medium text-[#3D2817] marker:content-none [&::-webkit-details-marker]:hidden">
      <span>Advanced</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-[#8B6F4E] transition-transform duration-200 group-open:rotate-180" />
    </summary>
    <div className="space-y-4 border-t border-[#1F1109]/[0.08] px-3 pb-3 pt-3">
      <div className="space-y-1.5">
        <Label
          htmlFor="create-slot-description"
          className="text-xs font-medium text-[#3D2817]"
        >
          Description
        </Label>
        <Textarea
          id="create-slot-description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Optional details for students"
          disabled={isSubmitting}
          className={cn(createSlotFieldClass, "min-h-[88px]")}
        />
      </div>
      <div className="space-y-1.5">
        <Label
          htmlFor="create-slot-youtube"
          className="text-xs font-medium text-[#3D2817]"
        >
          YouTube video ID
        </Label>
        <Input
          id="create-slot-youtube"
          value={youtubeId}
          onChange={(e) => onYoutubeIdChange(e.target.value)}
          placeholder="e.g. dQw4w9WgXcQ"
          disabled={isSubmitting}
          className={createSlotFieldClass}
        />
      </div>
    </div>
  </details>
);

export default AdvanceSection;
