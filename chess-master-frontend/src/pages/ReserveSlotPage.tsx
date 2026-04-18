import React, { useEffect, useState } from "react";
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

  const formatSlotTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = start.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const padTime = (d: Date) =>
      `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
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
      alert("Slot reserved! You'll receive payment instructions shortly.");
    } catch {
      alert("This slot was just taken.");
    } finally {
      setLoading(false);
    }
  };

  if (!slot) {
    return (
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
        {error && <p className="text-[#7A2E2E] mt-3 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center p-6">
      <div className="bg-white border border-[#1F1109]/[0.12] rounded-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#3D2817] p-6 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <defs>
              <pattern id="rsvpchk" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="30" height="30" fill="#FAF5EB" fillOpacity="0.03" />
                <rect x="30" y="30" width="30" height="30" fill="#FAF5EB" fillOpacity="0.03" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rsvpchk)" />
          </svg>
          <div className="relative">
            <h1
              className="text-xl font-medium text-[#F4ECDD] mb-1"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Play {slot.master.username}
            </h1>
            {slot.title && (
              <p className="text-sm text-[#F4ECDD]/70">{slot.title}</p>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {slot.description && (
            <p className="text-[13px] text-[#5C4631] leading-relaxed">{slot.description}</p>
          )}

          <div className="text-xs text-[#6B5640]">
            {formatSlotTime(slot.startTime, slot.endTime)}
          </div>

          <div className="text-center py-4 border-y border-[#1F1109]/[0.08]">
            <div
              className="text-3xl font-medium text-[#1F1109]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              ${slot.price}
            </div>
            <p className="text-xs text-[#6B5640] mt-1">One game + quick feedback</p>
          </div>

          <button
            disabled={loading || slot.status !== "free"}
            onClick={handleReserve}
            className={`w-full rounded-lg py-3 text-[13px] font-medium transition-colors ${
              slot.status === "free"
                ? loading
                  ? "bg-[#8B6F4E] cursor-wait"
                  : "bg-[#B8893D] text-[#1F1109] hover:bg-[#A37728]"
                : "bg-[#1F1109]/10 text-[#6B5640] cursor-not-allowed"
            }`}
          >
            {slot.status === "free"
              ? loading
                ? "Reserving..."
                : "Reserve this slot"
              : "Slot unavailable"}
          </button>

          <p className="text-center text-[11px] text-[#8B6F4E]">
            Slot held for 15 minutes after reservation
          </p>

          {slot.youtubeId && (
            <div className="pt-4">
              <iframe
                className="w-full aspect-video rounded-lg"
                src={`https://www.youtube.com/embed/${slot.youtubeId}`}
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReserveSlotPage;
