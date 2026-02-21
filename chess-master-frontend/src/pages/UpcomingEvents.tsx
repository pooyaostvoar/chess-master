import { UpcomingEventsSection } from "../components/event/UpcomingEventsSection";
import { UpcomingEventsTable } from "../components/event/UpcomingEventsTable";
import { useUpcomingEvents } from "../hooks/useUpcomingEvents";

export const UpcomingEventsPage = () => {
  const { events, loading, refetch: loadEvents } = useUpcomingEvents();
  return (
    <div className="container mx-auto px-4 py-8">
      {/* <h2 className="text-3xl font-bold mb-6">Upcoming Events</h2>
      <UpcomingEventsSection
        events={events}
        loading={loading}
        loadEvents={loadEvents}
      /> */}
      <h2 className="text-3xl font-bold mb-6">Upcoming Events</h2>
      <UpcomingEventsTable
        events={events}
        loadEvents={loadEvents}
        loading={loading}
      />
    </div>
  );
};
