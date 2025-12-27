import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { bookSlot, getSlotById, updateSlotStatus } from "../services/schedule";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const ReserveSlotPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const slotId = Number(id);
  const [slot, setSlot] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUser();

  // Utility to format time
  const formatSlotTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    const diffMs = start.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const padTime = (d: Date) =>
      `${d.getHours().toString().padStart(2, "0")}:${d
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (diffHours > 0) return `Today in ${diffHours}h ${diffMinutes}m`;
      else if (diffMinutes > 0) return `Today in ${diffMinutes}m`;
      else return `Starting now`;
    } else if (diffDays === 1) {
      return `Tomorrow at ${padTime(start)}`;
    } else {
      return `${start.toLocaleDateString()} at ${padTime(start)}`;
    }
  };

  const loadSlot = async () => {
    getSlotById(slotId)
      .then(setSlot)
      .catch(() => setError("Slot not found"));
  };
  useEffect(() => {
    loadSlot();
  }, [slotId]);

  const handleReserve = async () => {
    if (!user?.id) {
      navigate(`/login?redirect=/events/${slotId}`);
      return;
    }
    if (!slot) return;
    setLoading(true);
    try {
      await bookSlot(slotId);
      loadSlot();
      alert("Slot reserved! You’ll receive payment instructions shortly.");
    } catch {
      alert("This slot was just taken.");
    } finally {
      setLoading(false);
    }
  };

  if (!slot) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
        {error && <p className="text-red-600 mt-3">{error}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <Card className="shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl">
            Play {slot.master.username}
          </CardTitle>

          {slot.title && (
            <p className="text-lg font-semibold text-muted-foreground">
              {slot.title}
            </p>
          )}

          {slot.description && (
            <p className="text-sm text-muted-foreground">{slot.description}</p>
          )}

          <p className="text-muted-foreground">
            {formatSlotTime(slot.startTime, slot.endTime)}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold">${slot.price}</div>
            <p className="text-muted-foreground mt-1">
              One game + quick feedback
            </p>
          </div>

          <Button
            size="lg"
            className="w-full text-lg"
            disabled={loading || slot.status !== "free"}
            onClick={handleReserve}
          >
            {slot.status === "free"
              ? loading
                ? "Reserving..."
                : "Reserve this slot"
              : "Slot unavailable"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            ⏳ Slot held for 15 minutes after reservation
          </p>

          {slot.youtubeId && (
            <div className="pt-6">
              <iframe
                className="w-full aspect-video rounded-md"
                src={`https://www.youtube.com/embed/${slot.youtubeId}`}
                allowFullScreen
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReserveSlotPage;
