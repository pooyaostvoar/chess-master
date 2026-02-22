import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import {
  BadgeCheck,
  ShieldCheck,
  CalendarCheck,
  Globe,
  CreditCard,
} from "lucide-react";

const SESSION_CHIPS = [
  "Lessons",
  "Game Reviews",
  "Play a Master",
  "Blitz Sessions",
  "Beginner-Friendly",
] as const;

const TRUST_SIGNALS = [
  { label: "Verified masters", icon: BadgeCheck },
  { label: "Secure booking", icon: ShieldCheck },
  { label: "Sessions from $7", icon: CreditCard },
  { label: "Multiple languages", icon: Globe },
  { label: "Clear booking flow", icon: CalendarCheck },
] as const;

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="max-w-7xl mx-auto px-5 py-16 md:py-20 text-center">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 md:mb-6 max-w-4xl mx-auto leading-tight">
          Play, Learn, and Improve with Verified Chess Masters
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 opacity-95 max-w-2xl mx-auto leading-relaxed">
          Book one-on-one lessons, game reviews, and live play sessions with
          verified chess masters — whether you want to improve your game or
          simply enjoy the experience.
        </p>

        {/* Session type chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 md:mb-10">
          {SESSION_CHIPS.map((label) => (
            <span
              key={label}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-colors"
            >
              {label}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/signup")}
            className="text-lg px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-shadow"
          >
            Book Your First Session
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/masters")}
            className="text-lg px-8 py-6 bg-transparent border-2 border-white text-white hover:bg-white/10 font-medium"
          >
            Browse Masters
          </Button>
        </div>

        {/* Trust strip */}
        <div className="mt-10 md:mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm opacity-90">
            {TRUST_SIGNALS.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
