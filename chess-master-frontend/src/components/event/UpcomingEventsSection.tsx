import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";

import { UpcomingEventCard } from "./UpcomingEventCard";

import BookingModal from "../BookingModal";

interface UpcomingEventsSectionProps {
  events: any[];
  loading: boolean;
  loadEvents: () => void;
}

export const UpcomingEventsSection: React.FC<UpcomingEventsSectionProps> = ({
  events,
  loading,
  loadEvents,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">No upcoming events available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events?.map((event) => (
        <UpcomingEventCard
          key={event.id}
          event={event}
          onClick={() => {
            setSelectedEventId(event.id);
          }}
        />
      ))}
      <BookingModal
        slotId={selectedEventId}
        visible={Boolean(selectedEventId)}
        onClose={() => {
          setSelectedEventId(null);
        }}
        onBooked={() => {
          setSelectedEventId(null);
          loadEvents();
        }}
      />
    </div>
  );
};
