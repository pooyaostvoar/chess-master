import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getSlotsByMaster,
  createSlot as apiCreateSlot,
} from "../services/schedule";
import type { ScheduleSlot } from "../services/schedule";

interface ScheduleContextValue {
  events: ScheduleSlot[];
  loading: boolean;
  error: string | null;
  refreshSlots: () => Promise<void>;
  setEvents: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  createSlot: (data: any) => Promise<ScheduleSlot>;
}

const ScheduleContext = createContext<ScheduleContextValue | undefined>(
  undefined
);

interface Props {
  userId: string | undefined;
  children: React.ReactNode;
}

export const ScheduleProvider: React.FC<Props> = ({ userId, children }) => {
  const [events, setEvents] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getSlotsByMaster(Number(userId));
      const slots = res.slots || [];
      setEvents(slots);
      setError(null);
    } catch (err) {
      console.error("Failed to load slots", err);
      setError("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, [userId]);

  const refreshSlots = async () => {
    await loadSlots();
  };

  // New: create a slot and update events automatically
  const createSlot = async (data: any): Promise<ScheduleSlot> => {
    const { slot } = await apiCreateSlot(data);
    setEvents((prev) => [...prev, slot]); // add new slot to context state
    return slot;
  };

  return (
    <ScheduleContext.Provider
      value={{ events, loading, error, refreshSlots, setEvents, createSlot }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useCurrentUserSchedule = (): ScheduleContextValue => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error(
      "useCurrentUserSchedule must be used within a ScheduleProvider"
    );
  }
  return context;
};
