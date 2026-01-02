import { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import { updateUser } from "../services/auth";
import { useScheduleSlots } from "./useScheduleSlots";
import { useCurrentUserSchedule } from "../contexts/ScheduleContext";

type OnboardingState =
  | "UNKNOWN"
  | "NOT_MASTER"
  | "BECOMING_MASTER"
  | "MASTER_NO_INFO"
  | "MASTER_NO_SLOT"
  | "MASTER_READY";

const STORAGE_KEY = "onboarding_state";

const getStoredState = (): OnboardingState => {
  const value = localStorage.getItem(STORAGE_KEY);
  return (value as OnboardingState) || "UNKNOWN";
};

export function useMasterOnboarding() {
  const { user } = useUser();
  const [state, setState] = useState<OnboardingState>(getStoredState);
  const [loading, setLoading] = useState(false);

  const { events, loading: eventsLoading } = useCurrentUserSchedule();

  const persist = (newState: OnboardingState) => {
    setState(newState);
    localStorage.setItem(STORAGE_KEY, newState);
  };

  console.log("yooo:", eventsLoading, events);

  // 🔑 Single source of truth: backend data
  useEffect(() => {
    if (!user || eventsLoading === true) {
      return;
    }

    // if (getStoredState() === "MASTER_READY") {
    //   console.log("here???/");
    //   console.log(getStoredState());
    //   //persist("MASTER_READY");
    //   return;
    // }

    // Not a master
    if (!user.isMaster) {
      persist(state === "NOT_MASTER" ? "NOT_MASTER" : "UNKNOWN");
      return;
    }

    // Is master, missing info
    if (!user.rating) {
      persist("MASTER_NO_INFO");
      return;
    }

    // Has info, but no slots
    if (eventsLoading === false && events?.length === 0) {
      persist("MASTER_NO_SLOT");
      return;
    }

    // Fully ready

    persist("MASTER_READY");
  }, [user, events]);

  // Actions

  const setNotMaster = () => {
    persist("NOT_MASTER");
  };

  const becomeMaster = async () => {
    try {
      setLoading(true);
      persist("MASTER_NO_INFO");
      updateUser(user!.id, { isMaster: true });

      // state resolves via useEffect
    } catch (err) {
      persist("UNKNOWN");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Optional manual override after slot creation
  const markSlotAdded = () => {
    persist("MASTER_READY");
  };

  return {
    state,
    loading: loading || eventsLoading,

    // actions
    setNotMaster,
    becomeMaster,
    markSlotAdded,

    // helpers
    needsInfo: state === "MASTER_NO_INFO",
    needsSlot: state === "MASTER_NO_SLOT",
    isReady: state === "MASTER_READY",
  };
}
