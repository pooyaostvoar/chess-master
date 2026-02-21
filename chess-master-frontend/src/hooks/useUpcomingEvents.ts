import { useEffect, useState } from "react";
import { getUpcomingEvents } from "../services/api/schedule.api";

export function useUpcomingEvents(limit?: number | null) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      const data = await getUpcomingEvents();
      limit ? setEvents(data.slice(0, limit)) : setEvents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [limit]);
  return { events, loading, refetch: loadEvents };
}
