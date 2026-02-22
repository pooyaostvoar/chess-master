import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardHeader } from "../ui/card";
import {
  Search,
  CalendarCheck,
  CreditCard,
  CheckCircle2,
  MessageCircle,
  Target,
  PlayCircle,
  ShieldCheck,
  BadgeCheck,
  HelpCircle,
} from "lucide-react";

const STEPS = [
  {
    id: 1,
    title: "Browse Masters & Sessions",
    description:
      "Explore masters, lessons, game reviews, blitz sessions, and play experiences.",
    icon: Search,
  },
  {
    id: 2,
    title: "Book Your Session",
    description:
      "Choose a time/session that fits your goal and submit a booking request.",
    icon: CalendarCheck,
  },
  {
    id: 3,
    title: "Pay Securely",
    description: "Complete payment securely to reserve your booking request.",
    icon: CreditCard,
  },
  {
    id: 4,
    title: "Master Approves",
    description: "The master reviews and approves your booking request.",
    icon: CheckCircle2,
  },
  {
    id: 5,
    title: "Get Connected",
    description:
      "Once approved, you and the master can communicate via internal chat and/or receive a video call link.",
    icon: MessageCircle,
  },
  {
    id: 6,
    title: "Discuss the Details",
    description:
      "Coordinate how you want to play/train, your goals, and preferred platform/format.",
    icon: Target,
  },
  {
    id: 7,
    title: "Play, Learn, or Review",
    description:
      "Join the live session and enjoy the experience — whether for improvement or fun.",
    icon: PlayCircle,
  },
] as const;

const TRUST_ITEMS = [
  { label: "Verified masters", icon: BadgeCheck },
  { label: "Secure payments", icon: ShieldCheck },
  { label: "Clear booking flow", icon: CalendarCheck },
  { label: "Support if needed", icon: HelpCircle },
] as const;

interface ProcessStepProps {
  step: (typeof STEPS)[number];
  isLast?: boolean;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ step, isLast }) => {
  const Icon = step.icon;
  return (
    <div className="relative flex gap-4 md:gap-6 group">
      {/* Vertical connector line */}
      {!isLast && (
        <div
          className="absolute left-8 top-16 bottom-0 w-0.5 bg-primary/20 -translate-x-px"
          aria-hidden
        />
      )}
      <div className="relative z-10 flex-shrink-0">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30 group-hover:border-primary/60 group-hover:bg-primary/15 transition-colors">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
          {step.id}
        </span>
      </div>
      <div className="flex-1 min-w-0 pb-10 md:pb-14">
        <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {step.description}
        </p>
      </div>
    </div>
  );
};

interface StepCardProps {
  step: (typeof STEPS)[number];
}

const StepCard: React.FC<StepCardProps> = ({ step }) => {
  const Icon = step.icon;
  return (
    <Card className="h-full transition-shadow hover:shadow-md border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="inline-flex w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold items-center justify-center mb-2">
              {step.id}
            </span>
            <h3 className="font-semibold mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export const HowItWorksSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-5">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Book a session with a verified master in just a few steps.
          </p>
        </div>

        {/* Steps - Timeline on mobile, card grid on desktop */}
        <div className="relative max-w-2xl mx-auto lg:hidden">
          {STEPS.map((step, index) => (
            <ProcessStep
              key={step.id}
              step={step}
              isLast={index === STEPS.length - 1}
            />
          ))}
        </div>
        <div className="hidden lg:grid lg:grid-cols-4 gap-4 lg:max-w-6xl lg:mx-auto">
          {STEPS.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </div>

        {/* Trust / Reassurance badges */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-12 md:mt-16 py-6 border-t border-b border-border/60">
          {TRUST_ITEMS.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 md:mt-12">
          <Button
            size="lg"
            onClick={() => navigate("/signup")}
            className="text-lg px-8 w-full sm:w-auto"
          >
            Book Your First Session
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/masters")}
            className="text-lg px-8 w-full sm:w-auto"
          >
            Browse Masters
          </Button>
        </div>
      </div>
    </section>
  );
};
