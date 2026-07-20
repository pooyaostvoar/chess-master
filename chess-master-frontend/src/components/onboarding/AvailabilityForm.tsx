import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MasterOnboardingStep } from "@chess-master/schemas";
import { useUser } from "../../contexts/UserContext";
import { updateUser } from "../../services/auth";
import { getSlotsByMaster } from "../../services/schedule";
import MasterCalendarView from "../../pages/MasterCalendarView";

export const AvailabilityForm: React.FC = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const { slots } = await getSlotsByMaster(user.id);
      if (!slots?.length) {
        setError("Add at least one availability slot before continuing.");
        setLoading(false);
        return;
      }

      const data = await updateUser(user.id, {
        onboardingStatus: MasterOnboardingStep.Completed,
      });

      if (data.status === "success") {
        setUser({
          ...user,
          ...data.user,
          onboardingStatus: MasterOnboardingStep.Completed,
        });
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[#2C2416]">
          Set your availability
        </h2>
        <p className="mt-1 text-xs text-[#6B5A42]">
          Click and drag on the calendar to choose a time window, then confirm
          one-time or recurring slots — same as your schedule page.
        </p>
      </div>

      <MasterCalendarView userId={String(user.id)} embedded />

      {error && <p className="text-xs text-[#7A2E2E]">{error}</p>}

      <button
        type="button"
        onClick={handleContinue}
        disabled={loading}
        className="w-full bg-[#B8893D] text-[#1F1109] px-4 py-2.5 rounded-full text-xs font-medium hover:bg-[#A67B30] transition-colors disabled:opacity-60"
      >
        {loading ? "Finishing..." : "Finish onboarding"}
      </button>
    </div>
  );
};
