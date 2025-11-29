import React from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface ChessProfileSectionProps {
  title: string | null;
  rating: number | null;
  bio: string | null;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

export const ChessProfileSection: React.FC<ChessProfileSectionProps> = ({
  title,
  rating,
  bio,
  onChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Chess Profile</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Chess Title (optional)</Label>
          <select
            id="title"
            name="title"
            value={title || ""}
            onChange={onChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">No title</option>

            <option value="WCM">WCM - Woman Candidate Master</option>
            <option value="CM">CM - Candidate Master</option>

            <option value="WFM">WFM - Woman FIDE Master</option>
            <option value="FM">FM - FIDE Master</option>

            <option value="WIM">WIM - Woman International Master</option>
            <option value="IM">IM - International Master</option>

            <option value="WGM">WGM - Woman Grandmaster</option>
            <option value="GM">GM - Grandmaster</option>

            <option value="WNM">WNM - Woman National Master</option>
            <option value="NM">NM - National Master</option>
          </select>
        </div>

        <div>
          <Label htmlFor="rating">Rating (optional)</Label>
          <Input
            id="rating"
            type="number"
            name="rating"
            value={rating || ""}
            onChange={onChange}
            placeholder="e.g., 2000"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio (optional)</Label>
          <Textarea
            id="bio"
            name="bio"
            value={bio || ""}
            onChange={onChange}
            placeholder="Tell us about your chess journey..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};
