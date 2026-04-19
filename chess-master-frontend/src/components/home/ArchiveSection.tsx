import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFinishedEvents } from "../../services/api/schedule.api";

interface FinishedEvent {
  id: number;
  title: string;
  youtubeId: string;
  master: {
    id: number;
    username: string;
    title?: string | null;
  };
}

const CARD_COLORS = ["#5C3A1E", "#B8893D", "#7A2E2E", "#2E4A7A", "#3D5C1E"] as const;

function getCardColor(index: number): string {
  return CARD_COLORS[index % CARD_COLORS.length];
}

export const ArchiveSection: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<FinishedEvent[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFinishedEvents()
      .then((res) => {
        setEvents(
          res.events.slice(0, 3).map((e: any) => ({
            id: e.id,
            title: e.title,
            youtubeId: e.youtubeId,
            master: e.master,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-[#FAF5EB]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) return null;

  return (
    <section className="bg-[#FAF5EB]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 gap-5">
          <div>
            <div
              className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              From the archive
            </div>
            <h2
              className="text-[24px] sm:text-[28px] font-medium text-[#1F1109] leading-[1.1] mb-1.5 tracking-[-0.01em]"
              style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
            >
              Watch a real session
            </h2>
            <p className="text-xs text-[#6B5640] leading-relaxed max-w-[380px] m-0">
              Recorded lessons, game reviews, and tournament breakdowns from our
              masters.
            </p>
          </div>
          <button
            onClick={() => navigate("/events")}
            className="text-xs text-[#B8893D] font-medium whitespace-nowrap hover:underline"
          >
            Browse all →
          </button>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {events.map((event, i) => {
            const bg = getCardColor(i);
            const isGold = bg === "#B8893D";
            const patternId = `archivecheck-${event.id}`;

            return (
              <div
                key={event.id}
                className="bg-white border border-[#1F1109]/[0.12] rounded-xl overflow-hidden group"
              >
                {/* Thumbnail */}
                <div
                  className="h-28 relative overflow-hidden cursor-pointer"
                  onClick={() => setActiveVideo(event.youtubeId)}
                >
                  {event.youtubeId ? (
                    <img
                      src={`https://img.youtube.com/vi/${event.youtubeId}/hqdefault.jpg`}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <div
                        className="absolute inset-0"
                        style={{ backgroundColor: bg }}
                      />
                      <svg
                        className="absolute inset-0 w-full h-full"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <pattern
                            id={patternId}
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
                        <rect
                          width="100%"
                          height="100%"
                          fill={`url(#${patternId})`}
                        />
                      </svg>
                    </>
                  )}

                  {/* Play button */}
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                      isGold && !event.youtubeId
                        ? "bg-[#1F1109]"
                        : "bg-[#B8893D]"
                    }`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="#FAF5EB"
                    >
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
          })}
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-[#1F1109] rounded-xl p-4 w-full max-w-3xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-4 text-lg font-bold text-[#F4ECDD] hover:text-white"
              onClick={() => setActiveVideo(null)}
            >
              ✕
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-lg mt-2">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                title="Session Recording"
                frameBorder="0"
                allow="autoplay"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
