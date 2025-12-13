import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface Props {
  startTime: string;
  endTime: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SlotTimeSection: React.FC<Props> = ({
  startTime,
  endTime,
  onChange,
}) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold">Time</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          type="datetime-local"
          id="startTime"
          name="startTime"
          value={startTime}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="endTime">End Time</Label>
        <Input
          type="datetime-local"
          id="endTime"
          name="endTime"
          value={endTime}
          onChange={onChange}
          required
        />
      </div>
    </div>
  </div>
);
