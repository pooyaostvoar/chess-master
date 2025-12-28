import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface Props {
  title: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SlotBasicInfoSection: React.FC<Props> = ({ title, onChange }) => (
  <div className="space-y-2">
    <div>
      <Label htmlFor="title">Slot Title</Label>
      <Input
        id="title"
        name="title"
        value={title}
        onChange={onChange}
        placeholder="e.g. Endgame Masterclass"
      />
    </div>
  </div>
);
