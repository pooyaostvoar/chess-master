import { UpcomingEventsTable } from "../components/event/UpcomingEventsTable";
import { useUpcomingEvents } from "../hooks/useUpcomingEvents";

export const UpcomingEventsPage = () => {
  const { events, loading, refetch: loadEvents } = useUpcomingEvents();
  return (
    <div className="bg-[#FAF5EB] min-h-screen">
      <div className="bg-[#F4ECDD] border-b border-[#1F1109]/[0.08]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div
            className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Live sessions
          </div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[#1F1109] leading-[1.1] tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            Upcoming events
          </h1>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <UpcomingEventsTable
          events={events}
          loadEvents={loadEvents}
          loading={loading}
        />
      </div>
    </div>
  );
};
