import React from "react";

const CARD_COLORS = ["#5C3A1E", "#B8893D", "#7A2E2E"] as const;

interface FinishedEvent {
  id: number;
  title: string;
  youtubeId: string;
  master: {
    id: number;
    username: string;
    title?: string | null;
    profilePictureThumbnailUrl?: string;
  };
}

interface FinishedEventCardProps {
  event: FinishedEvent;
  onPlay: (youtubeId: string) => void;
}

export const FinishedEventCard: React.FC<FinishedEventCardProps> = ({
  event,
  onPlay,
}) => {
  const bg = CARD_COLORS[event.id % CARD_COLORS.length];
  const isGold = bg === "#B8893D";

  return (
    <div
      className="bg-white border border-[#1F1109]/[0.12] rounded-xl overflow-hidden cursor-pointer group hover:shadow-md transition-shadow"
      onClick={() => onPlay(event.youtubeId)}
    >
      {/* Thumbnail */}
      <div className="h-28 relative overflow-hidden" style={{ backgroundColor: bg }}>
        {event.youtubeId ? (
          <img
            src={`https://img.youtube.com/vi/${event.youtubeId}/hqdefault.jpg`}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern
                id={`finchk-${event.id}`}
                x="0"
                y="0"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  fill={isGold ? "#1F1109" : "#FAF5EB"}
                  fillOpacity={isGold ? 0.08 : 0.06}
                />
                <rect
                  x="20"
                  y="20"
                  width="20"
                  height="20"
                  fill={isGold ? "#1F1109" : "#FAF5EB"}
                  fillOpacity={isGold ? 0.08 : 0.06}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#finchk-${event.id})`} />
          </svg>
        )}

        {/* Play button */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
            isGold && !event.youtubeId ? "bg-[#1F1109]" : "bg-[#B8893D]"
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#FAF5EB">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* Body */}
      <div className="px-3.5 py-3 pb-3.5">
        <div className="text-[13px] font-medium text-[#1F1109] leading-[1.35] mb-2 line-clamp-2">
          {event.title}
        </div>
        <div className="flex items-center gap-1.5">
          {event.master?.title && (
            <span
              className="text-[9px] font-medium text-[#F4ECDD] px-1.5 py-0.5 rounded-[3px] tracking-[0.06em]"
              style={{ backgroundColor: bg }}
            >
              {event.master.title}
            </span>
          )}
          <span className="text-[11px] text-[#6B5640]">
            {event.master?.username}
          </span>
        </div>
      </div>
    </div>
  );
};
