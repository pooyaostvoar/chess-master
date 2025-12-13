import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { updateSlot, getSlotById } from "../services/schedule";

import { SlotBasicInfoSection } from "../components/slots/SlotBasicInfoSection";
import { SlotTimeSection } from "../components/slots/SlotTimeSection";
import { SlotVideoSection } from "../components/slots/SlotVideoSection";

const EditSlot: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    const loadSlot = async () => {
      try {
        const slot = await getSlotById(Number(id));

        setFormData({
          startTime: slot.startTime.slice(0, 16),
          endTime: slot.endTime.slice(0, 16),
          title: slot.title || "",
          youtubeId: slot.youtubeId || "",
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
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

    try {
      await updateSlot(Number(id), {
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        title: formData.title || undefined,
        youtubeId: formData.youtubeId || undefined,
      });

      setMessage("Slot updated successfully");
      setMessageType("success");

      //   setTimeout(() => navigate("/events"), 1200);
    } catch (err: any) {
      setMessage(err.message);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Edit Slot</CardTitle>
          <CardDescription>
            Update slot details and video information
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <SlotBasicInfoSection
              title={formData.title}
              onChange={handleChange}
            />

            <SlotTimeSection
              startTime={formData.startTime}
              endTime={formData.endTime}
              onChange={handleChange}
            />

            <SlotVideoSection
              youtubeId={formData.youtubeId}
              onChange={handleChange}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Saving..." : "Save Changes"}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default EditSlot;
