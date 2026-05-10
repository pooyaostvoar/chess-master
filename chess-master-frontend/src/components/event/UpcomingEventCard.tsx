import React from "react";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import { MEDIA_URL } from "../../services/config";

interface Props {
  event: any;
  onClick: () => void;
}

export const UpcomingEventCard: React.FC<Props> = ({ event, onClick }) => {
  const navigate = useNavigate();
  const { user, loading: isUserloading } = useUser();
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);
  const durationMinutes = (end.getTime() - start.getTime()) / 60000;

  return (
    <div className="bg-white border border-[#1F1109]/[0.12] rounded-xl overflow-hidden flex flex-col h-full hover:shadow-md hover:border-[#1F1109]/25 transition-all">
      <div className="p-4 flex-1">
        <h3
          className="text-base font-medium text-[#1F1109] mb-3"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {event.title ?? "Blitz session"}
        </h3>

        {/* Master info */}
        <div className="flex items-center gap-2 mb-3">
          {event.master?.profilePictureThumbnailUrl ? (
            <img
              src={MEDIA_URL + event.master.profilePictureThumbnailUrl}
              alt={event.master?.username}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#3D2817] flex items-center justify-center text-[#F4ECDD] text-sm font-medium flex-shrink-0">
              {event.master?.username?.charAt(0).toUpperCase() || "M"}
            </div>
          )}
          <div>
            <span className="text-xs font-medium text-[#1F1109]">{event.master?.username}</span>
            {event.master?.title && (
              <span className="ml-1.5 text-[9px] font-medium bg-[#3D2817] text-[#F4ECDD] px-1.5 py-0.5 rounded tracking-[0.06em]">
                {event.master.title}
              </span>
            )}
          </div>
        </div>

        {/* Languages */}
        {event.master?.languages && event.master.languages.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {event.master.languages.slice(0, 3).map((lang: string) => (
              <span key={lang} className="text-[10px] bg-[#B8893D]/[0.14] text-[#6B4F1F] px-2 py-0.5 rounded-full">
                {lang}
              </span>
            ))}
          </div>
        )}

        {/* Time */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#6B5640]">
          <Clock className="h-3 w-3" />
          {start.toLocaleDateString()}, {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {durationMinutes} min
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 mt-auto space-y-3">
        <div className="text-base font-medium text-[#1F1109]">
          ${event.price ?? 0}
        </div>
        <button
          className="w-full bg-[#B8893D] text-[#1F1109] rounded-lg py-2.5 text-[13px] font-medium hover:bg-[#A37728] transition-colors"
          onClick={() => {
            if (!user && !isUserloading) {
              navigate("/login");
              return;
            }
            onClick();
          }}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};
