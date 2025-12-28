import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface Props {
  description: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SlotDescriptionSection: React.FC<Props> = ({
  description,
  onChange,
}) => (
  <div className="space-y-2">
    <div>
      <Label htmlFor="description">Slot description</Label>
      <Input
        id="description"
        name="description"
        value={description}
        onChange={onChange}
        placeholder="e.g. Endgame Masterclass"
      />
    </div>
  </div>
);
