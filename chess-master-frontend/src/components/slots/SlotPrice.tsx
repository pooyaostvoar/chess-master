import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

interface Props {
  price: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SlotPrice: React.FC<Props> = ({ price, onChange }) => (
  <div className="space-y-1">
    <Label htmlFor="price">Slot Price</Label>

    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        $
      </span>

      <Input
        id="price"
        name="price"
        type="number"
        value={price}
        onChange={onChange}
        placeholder="0.00"
        min="0"
        step="0.01"
        className="pl-7"
      />
    </div>
  </div>
);
