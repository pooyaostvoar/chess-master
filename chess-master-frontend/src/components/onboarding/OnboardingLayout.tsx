import React from "react";
import { MasterOnboardingStep } from "@chess-master/schemas";

export const ONBOARDING_STEPS: MasterOnboardingStep[] = [
  MasterOnboardingStep.BasicInfo,
  MasterOnboardingStep.ChessProfile,
  MasterOnboardingStep.BioAndSections,
  MasterOnboardingStep.SocialLinks,
  MasterOnboardingStep.FeaturedVideos,
  MasterOnboardingStep.Availability,
  MasterOnboardingStep.Completed,
];

export function getOnboardingStepIndex(step: MasterOnboardingStep): number {
  const index = ONBOARDING_STEPS.indexOf(step);
  return index === -1 ? 0 : index;
}

interface OnboardingLayoutProps {
  currentStep: MasterOnboardingStep;
  children: React.ReactNode;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  currentStep,
  children,
}) => {
  const activeIndex = getOnboardingStepIndex(currentStep);
  const isWideStep =
    currentStep === MasterOnboardingStep.Availability ||
    currentStep === MasterOnboardingStep.Completed;

  return (
    <div className="bg-[#FAF5EB] min-h-screen flex items-start justify-center px-4 py-8 sm:px-6 sm:py-10 overflow-x-hidden">
      <div
        className={`w-full min-w-0 ${
          isWideStep ? "max-w-[1800px]" : "max-w-md"
        }`}
      >
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-[#2C2416] sm:text-xl">
            Let's get your profile ready
          </h1>
          <p className="mt-2 text-xs text-[#6B5A42] sm:text-sm">
            We're just collecting a few details — it only takes a couple of
            minutes.
          </p>
        </div>

        <div className={`mb-6 min-w-0 overflow-hidden ${isWideStep ? "max-w-md mx-auto" : ""}`}>
          <div className="flex min-w-0 items-center">
            {ONBOARDING_STEPS.map((step, index) => {
              const isLit = index <= activeIndex;
              const isCurrent = index === activeIndex;

              return (
                <React.Fragment key={step}>
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors sm:h-6 sm:w-6 sm:text-[11px] ${
                      isLit
                        ? isCurrent
                          ? "bg-[#B8893D] text-[#1F1109] border-2 border-[#D4A84B]"
                          : "bg-[#B8893D] text-[#1F1109]"
                        : "bg-[#1F1109]/[0.08] text-[#9C8366]"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < ONBOARDING_STEPS.length - 1 && (
                    <div
                      className={`mx-0.5 h-0.5 min-w-0 flex-1 rounded-full transition-colors sm:mx-1 ${
                        index < activeIndex ? "bg-[#B8893D]" : "bg-[#1F1109]/[0.1]"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[11px] text-[#8B6F4E]">
            Step {activeIndex + 1} of {ONBOARDING_STEPS.length}
          </p>
        </div>

        <div
          className={`min-w-0 overflow-hidden rounded-xl border border-[#1F1109]/[0.08] bg-white/60 ${
            isWideStep ? "p-3 sm:p-5" : "p-4 sm:p-5"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
