import React from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  FileSearch,
  Swords,
  Zap,
  Sparkles,
} from "lucide-react";
import { SessionTypeCard } from "./SessionTypeCard";
import { Button } from "../ui/button";

const USE_CASES = [
  {
    id: "coaching",
    title: "1-on-1 Coaching",
    description:
      "Improve fundamentals, strategy, openings, and endgames.",
    icon: GraduationCap,
    tags: ["Popular", "30–60 min"],
  },
  {
    id: "game-reviews",
    title: "Game Reviews",
    description:
      "Get personalized feedback on your games and mistakes.",
    icon: FileSearch,
    tags: ["Personalized", "From $7"],
  },
  {
    id: "play-master",
    title: "Play a Master",
    description:
      "Enjoy the experience of playing a titled player live.",
    icon: Swords,
    tags: ["Live games", "Rated"],
  },
  {
    id: "blitz-rapid",
    title: "Blitz & Rapid Practice",
    description:
      "Fast-paced sparring and practical training sessions.",
    icon: Zap,
    tags: ["Fast", "5–10 min"],
  },
  {
    id: "beginner-friendly",
    title: "Beginner-Friendly Sessions",
    description:
      "Friendly, low-pressure sessions for newer players.",
    icon: Sparkles,
    tags: ["Beginner", "Patient coaches"],
  },
] as const;

export const FeaturedSessionTypesSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-5">
        {/* Section label */}
        <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2 text-center">
          Ways to Use
        </p>

        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How You Can Use Chess Master
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you want to improve, get feedback, or simply play a master
            for fun, you can find the right session here.
          </p>
        </div>

        {/* Informational use-case cards (no per-card CTAs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {USE_CASES.map((useCase) => (
            <SessionTypeCard
              key={useCase.id}
              id={useCase.id}
              title={useCase.title}
              description={useCase.description}
              icon={useCase.icon}
              tags={useCase.tags}
            />
          ))}
        </div>

        {/* Single shared CTA area */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10 md:mt-12">
          <Button
            size="lg"
            onClick={() => navigate("/masters")}
            className="text-lg px-8"
            data-cta="browse-masters"
          >
            Browse Masters
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/signup")}
            className="text-lg px-8"
            data-cta="book-first-session"
          >
            Book Your First Session
          </Button>
        </div>
      </div>
    </section>
  );
};
