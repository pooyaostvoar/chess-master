import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface Props {
  youtubeId: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SlotVideoSection: React.FC<Props> = ({ youtubeId, onChange }) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold">Video</h3>

    <div>
      <Label htmlFor="youtubeId">YouTube Video ID</Label>
      <Input
        id="youtubeId"
        name="youtubeId"
        value={youtubeId}
        onChange={onChange}
        placeholder="e.g. dQw4w9WgXcQ"
      />
    </div>

    {youtubeId && (
      <div className="aspect-video rounded-lg overflow-hidden border mt-3">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="Slot Video Preview"
          allowFullScreen
        />
      </div>
    )}
  </div>
);
