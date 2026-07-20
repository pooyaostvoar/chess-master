import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { MasterOnboardingStep } from "@chess-master/schemas";
import { useUser } from "../contexts/UserContext";

/**
 * Redirects masters with incomplete onboarding to `/onboarding`.
 */
export const MasterOnboardingGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
      </div>
    );
  }

  const needsOnboarding =
    user?.isMaster &&
    user.onboardingStatus !== MasterOnboardingStep.Completed;

  if (needsOnboarding && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
