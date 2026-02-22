import React from "react";
import { OnboardingFlow } from "../components/onboarding/OnboardingFlow";

export const ONBOARDING_STORAGE_KEY = "chess_master_onboarding_completed";

export const GettingStarted: React.FC = () => {

  const handleComplete = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  };

  const handleSkip = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Get started in under a minute
        </h1>
        <p className="text-muted-foreground">
          Tell us a bit about what you&apos;re looking for — we&apos;ll match you
          with masters who fit.
        </p>
      </div>

      <OnboardingFlow onComplete={handleComplete} onSkip={handleSkip} />
    </div>
  );
};

export default GettingStarted;
