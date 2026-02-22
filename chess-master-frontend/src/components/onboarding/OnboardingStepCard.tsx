import React from "react";
import { cn } from "../../lib/utils";

interface OnboardingStepCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const OnboardingStepCard: React.FC<OnboardingStepCardProps> = ({
  title,
  subtitle,
  children,
  className,
}) => (
  <div
    className={cn(
      "rounded-xl border bg-card shadow-sm p-6 md:p-8",
      "max-w-lg mx-auto w-full min-w-0",
      className
    )}
  >
    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
      {title}
    </h2>
    {subtitle && (
      <p className="text-muted-foreground text-sm md:text-base mb-6">
        {subtitle}
      </p>
    )}
    {children}
  </div>
);
