import { useCallback, useEffect, useRef, useState } from "react";
import { getUpcomingEvents } from "../services/api/schedule.api";

export function startOfLocalDay(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function endOfLocalDay(date: Date) {
  const end = startOfLocalDay(date);
  end.setDate(end.getDate() + 1);
  return end;
}

type UseUpcomingEventsOptions = {
  limit?: number | null;
  date?: Date | null;
};

export function useUpcomingEvents(options: UseUpcomingEventsOptions = {}) {
  const { limit, date } = options;
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  const from = date ? startOfLocalDay(date).toISOString() : undefined;
  const to = date ? endOfLocalDay(date).toISOString() : undefined;

  const loadEvents = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const data = await getUpcomingEvents({
        limit: limit ?? undefined,
        from,
        to,
      });
      if (id !== requestId.current) {
        return;
      }
      setEvents(limit ? data.slice(0, limit) : data);
    } finally {
      if (id === requestId.current) {
        setLoading(false);
      }
    }
  }, [limit, from, to]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return { events, loading, refetch: loadEvents };
}
