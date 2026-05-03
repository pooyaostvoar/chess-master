import React from "react";
import { ChevronDown } from "lucide-react";

import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";

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
          onChange={(e) => onDescriptionChange(e.target.value)}
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
          onChange={(e) => onYoutubeIdChange(e.target.value)}
          placeholder="e.g. dQw4w9WgXcQ"
          disabled={isSubmitting}
          className="border-[#1F1109]/20 bg-white"
        />
      </div>
    </div>
  </details>
);

export default AdvanceSection;
