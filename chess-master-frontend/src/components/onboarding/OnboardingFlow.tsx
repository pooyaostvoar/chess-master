import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingProgress } from "./OnboardingProgress";
import { OnboardingStepCard } from "./OnboardingStepCard";
import { SelectableChip } from "./SelectableChip";
import { RecommendedMastersPreview } from "./RecommendedMastersPreview";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TOTAL_STEPS = 4;

// Step 1: Goal options
const GOAL_OPTIONS = [
  { id: "improve", label: "Improve my chess" },
  { id: "review", label: "Get a game review" },
  { id: "play", label: "Play a master for fun" },
  { id: "blitz", label: "Practice blitz/rapid" },
  { id: "beginner", label: "I'm a beginner and want guidance" },
] as const;

// Step 2: Skill level
const SKILL_OPTIONS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "tournament", label: "Tournament player" },
] as const;

// Step 3: Preferences (keep short)
const SESSION_TYPE_OPTIONS = [
  { id: "lesson", label: "Lesson" },
  { id: "review", label: "Game review" },
  { id: "play", label: "Play session" },
  { id: "blitz", label: "Blitz" },
] as const;

const BUDGET_OPTIONS = [
  { id: "under10", label: "Under $10" },
  { id: "under20", label: "Under $20" },
  { id: "flexible", label: "Flexible" },
] as const;

// Map goal to Masters page intent param
const GOAL_TO_INTENT: Record<string, string> = {
  improve: "lesson",
  review: "review",
  play: "play",
  blitz: "blitz",
  beginner: "beginner",
};

export interface OnboardingState {
  goal: string | null;
  skillLevel: string | null;
  rating: string;
  sessionType: string | null;
  budget: string | null;
}

const INITIAL_STATE: OnboardingState = {
  goal: null,
  skillLevel: null,
  rating: "",
  sessionType: null,
  budget: null,
};

interface OnboardingFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onSkip,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);

  const fireAnalytics = useCallback((event: string, data?: Record<string, unknown>) => {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", event, data);
    }
    // Also set data attribute for other analytics
    document.body.setAttribute(`data-onboarding-${event}`, "true");
  }, []);

  const goToMasters = useCallback(() => {
    const intent = state.goal ? GOAL_TO_INTENT[state.goal] : undefined;
    const params = intent ? `?intent=${intent}` : "";
    navigate(`/masters${params}`);
    fireAnalytics("onboarding_recommendation_cta_clicked");
    onComplete?.();
  }, [state.goal, navigate, fireAnalytics, onComplete]);

  const handleSkip = useCallback(() => {
    fireAnalytics("onboarding_skipped", { step });
    onSkip?.();
    navigate("/masters");
  }, [step, navigate, fireAnalytics, onSkip]);

  const handleComplete = useCallback(() => {
    fireAnalytics("onboarding_completed");
    goToMasters();
  }, [fireAnalytics, goToMasters]);

  const handleViewSchedule = useCallback(
    (userId: number) => {
      fireAnalytics("onboarding_recommendation_cta_clicked", { cta: "book_first" });
      navigate(`/calendar/${userId}`);
      onComplete?.();
    },
    [navigate, fireAnalytics, onComplete]
  );

  const canProceed = () => {
    if (step === 1) return state.goal != null;
    if (step === 2) return state.skillLevel != null;
    if (step === 3) return true; // preferences are optional
    return true;
  };

  const handleNext = () => {
    fireAnalytics("onboarding_step_completed", { step });
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  return (
    <div
      className="min-h-[60vh] flex flex-col"
      data-analytics="onboarding_flow"
      data-onboarding-started="true"
    >
      <div className="mb-6">
        <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Step 1: Goal */}
      {step === 1 && (
        <OnboardingStepCard
          title="What do you want to do first?"
          subtitle="We'll help you find the right masters"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((opt) => (
                <SelectableChip
                  key={opt.id}
                  label={opt.label}
                  selected={state.goal === opt.id}
                  onSelect={() => setState((s) => ({ ...s, goal: opt.id }))}
                  data-analytics={`onboarding_goal_${opt.id}`}
                />
              ))}
            </div>
          </div>
        </OnboardingStepCard>
      )}

      {/* Step 2: Skill level */}
      {step === 2 && (
        <OnboardingStepCard
          title="What's your level?"
          subtitle="Helps us suggest suitable masters"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SKILL_OPTIONS.map((opt) => (
                <SelectableChip
                  key={opt.id}
                  label={opt.label}
                  selected={state.skillLevel === opt.id}
                  onSelect={() =>
                    setState((s) => ({ ...s, skillLevel: opt.id }))
                  }
                  data-analytics={`onboarding_skill_${opt.id}`}
                />
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-muted-foreground text-sm">
                Optional: Enter your rating (Chess.com / Lichess / FIDE)
              </Label>
              <Input
                id="rating"
                type="text"
                placeholder="e.g. 1200"
                value={state.rating}
                onChange={(e) =>
                  setState((s) => ({ ...s, rating: e.target.value }))
                }
                className="max-w-[140px]"
              />
            </div>
          </div>
        </OnboardingStepCard>
      )}

      {/* Step 3: Preferences */}
      {step === 3 && (
        <OnboardingStepCard
          title="A few quick preferences"
          subtitle="Optional — you can change these anytime"
        >
          <div className="space-y-6">
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Preferred session type
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SESSION_TYPE_OPTIONS.map((opt) => (
                  <SelectableChip
                    key={opt.id}
                    label={opt.label}
                    selected={state.sessionType === opt.id}
                    onSelect={() =>
                      setState((s) => ({ ...s, sessionType: opt.id }))
                    }
                  />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Budget comfort
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {BUDGET_OPTIONS.map((opt) => (
                  <SelectableChip
                    key={opt.id}
                    label={opt.label}
                    selected={state.budget === opt.id}
                    onSelect={() =>
                      setState((s) => ({ ...s, budget: opt.id }))
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </OnboardingStepCard>
      )}

      {/* Step 4: Results */}
      {step === 4 && (
        <OnboardingStepCard
          title="Great — here are some masters to start with"
          subtitle="Based on your preferences"
        >
          <RecommendedMastersPreview
            intent={state.goal ? GOAL_TO_INTENT[state.goal] : undefined}
            onViewMasters={goToMasters}
            onBookFirst={goToMasters}
            onViewSchedule={handleViewSchedule}
            onCtaClick={() => fireAnalytics("onboarding_recommendation_cta_clicked")}
          />
        </OnboardingStepCard>
      )}

      {/* Navigation */}
      <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 max-w-lg mx-auto w-full">
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-analytics="onboarding_skip"
        >
          Skip for now
        </button>
        <div className="flex gap-3 w-full sm:w-auto">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 sm:flex-initial"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          )}
          {step < 4 && (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 sm:flex-initial"
              data-analytics="onboarding_next"
            >
              {step === 3 ? "See recommendations" : "Next"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
