import React, { useEffect, useState, useMemo } from "react";
import { FinishedEventCard } from "./FinishedEventCard";
import { getFinishedEvents } from "../../services/api/schedule.api";

interface FinishedEventsSectionProps {
  limit?: number | null;
  searchPhrase?: string | null;
}

export const FinishedEventsSection: React.FC<FinishedEventsSectionProps> = ({
  limit = null,
  searchPhrase = null,
}) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [finishedEvents, setFinishedEvent] = useState<any[]>([]);

  async function loadEvents() {
    const res = await getFinishedEvents();
    setFinishedEvent(
      res.events.map((event: any) => ({
        id: event.id,
        title: event.title,
        youtubeId: event.youtubeId,
        master: event.master,
      }))
    );
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = finishedEvents;

    if (searchPhrase && searchPhrase.trim() !== "") {
      const searchLower = searchPhrase.toLowerCase().trim();
      filtered = filtered.filter(
        (event: any) =>
          event.title?.toLowerCase().includes(searchLower) ||
          event.master?.username?.toLowerCase().includes(searchLower)
      );
    }

    if (limit !== null && limit > 0) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [finishedEvents, searchPhrase, limit]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredEvents.map((event: any) => (
          <FinishedEventCard
            key={event.id}
            event={event}
            onPlay={(youtubeId) => setActiveVideo(youtubeId)}
          />
        ))}
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
                title="Finished Event"
                frameBorder="0"
                allow="autoplay"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
