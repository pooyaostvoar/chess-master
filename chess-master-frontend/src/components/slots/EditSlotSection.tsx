import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { updateSlot, getSlotById } from "../../services/schedule";

import { SlotBasicInfoSection } from "../../components/slots/SlotBasicInfoSection";
import { SlotTimeSection } from "../../components/slots/SlotTimeSection";
import { SlotVideoSection } from "../../components/slots/SlotVideoSection";
import { SlotPrice } from "../../components/slots/SlotPrice";
import { SlotDescriptionSection } from "./SlotDescriptionSection";
import { slotIsPeriodicSeriesChunk } from "../../utils/slotUtils";

export type PeriodicScopeSubmitPayload = {
  startTime: string;
  endTime: string;
  title?: string;
  youtubeId?: string;
  price: number;
  description?: string;
};

interface Props {
  id: number;
  onUpdate?: () => void;
  /** Compact dialog layout (no full-page chrome). */
  embedded?: boolean;
  /**
   * Master calendar: recurring slots delegate save to parent so user can pick
   * “whole series” vs “this slot” before calling the API.
   */
  onRequirePeriodicScopeChoice?: (args: {
    slotId: number;
    payload: PeriodicScopeSubmitPayload;
  }) => void;
}

const EditSlotSection: React.FC<Props> = ({
  id,
  onUpdate,
  embedded = false,
  onRequirePeriodicScopeChoice,
}: Props) => {
  const [formData, setFormData] = useState<any>(null);
  /** Loaded slot from API — used to detect periodic series. */
  const [sourceSlot, setSourceSlot] = useState<Record<string, unknown> | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  const isoToDateTimeLocal = (iso: string) => {
    if (!iso) return "";

    const date = new Date(iso);

    if (isNaN(date.getTime())) return "";

    const pad = (n: number) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  useEffect(() => {
    const loadSlot = async () => {
      try {
        const slot = await getSlotById(Number(id));
        setSourceSlot(slot as Record<string, unknown>);
        setFormData({
          startTime: isoToDateTimeLocal(slot.startTime),
          endTime: isoToDateTimeLocal(slot.endTime),
          title: slot.title || "",
          youtubeId: slot.youtubeId || "",
          price: slot.price || "0.00",
          description: slot.description || "",
        });
      } catch (err: any) {
        setMessage(err.message);
        setMessageType("error");
      }
    };

    if (id) loadSlot();
  }, [id]);

  if (!formData) {
    return (
      <div
        className={
          embedded
            ? "flex flex-col items-center justify-center py-12"
            : "flex flex-col items-center justify-center min-h-[60vh]"
        }
      >
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5" />
        <p className="text-muted-foreground">Loading slot...</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const payload: PeriodicScopeSubmitPayload = {
      startTime: new Date(formData.startTime).toISOString(),
      endTime: new Date(formData.endTime).toISOString(),
      title: formData.title || undefined,
      youtubeId: formData.youtubeId || undefined,
      price: parseFloat(formData.price),
      description: formData.description || undefined,
    };

    try {
      if (
        onRequirePeriodicScopeChoice &&
        sourceSlot &&
        slotIsPeriodicSeriesChunk(sourceSlot)
      ) {
        onRequirePeriodicScopeChoice({ slotId: Number(id), payload });
        setLoading(false);
        return;
      }

      await updateSlot(Number(id), {
        startTime: payload.startTime,
        endTime: payload.endTime,
        title: payload.title,
        youtubeId: payload.youtubeId,
        price: payload.price,
        description: payload.description,
      });

      setMessage("Slot updated successfully");
      setMessageType("success");
      onUpdate && onUpdate();
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const formInner = (
    <form onSubmit={handleSubmit} className={embedded ? "space-y-5" : "space-y-8"}>
      <SlotBasicInfoSection title={formData.title} onChange={handleChange} />
      <SlotDescriptionSection
        description={formData.description}
        onChange={handleChange}
      />
      <SlotPrice price={formData.price} onChange={handleChange} />

      <SlotTimeSection
        startTime={formData.startTime}
        endTime={formData.endTime}
        onChange={handleChange}
      />

      <SlotVideoSection youtubeId={formData.youtubeId} onChange={handleChange} />

      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? "Saving..." : "Save changes"}
      </Button>

      {message && (
        <div
          className={`p-4 rounded-md text-center ${
            messageType === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );

  if (embedded) {
    return formInner;
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 h-full overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Edit Slot</CardTitle>
          <CardDescription>
            Update slot details and video information
          </CardDescription>
        </CardHeader>

        <CardContent>{formInner}</CardContent>
      </Card>
    </div>
  );
};

export default EditSlotSection;
