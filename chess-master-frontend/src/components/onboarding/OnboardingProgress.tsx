import React from "react";
import { cn } from "../../lib/utils";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  className,
}) => (
  <div
    className={cn("flex items-center gap-2", className)}
    data-analytics="onboarding_progress"
    data-step={currentStep}
  >
    <span className="text-sm font-medium text-muted-foreground">
      Step {currentStep} of {totalSteps}
    </span>
    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>
  </div>
);
