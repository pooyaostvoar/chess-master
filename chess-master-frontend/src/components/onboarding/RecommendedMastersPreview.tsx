import React, { useEffect, useState } from "react";
import { findUsers } from "../../services/api/user.api";
import type { User } from "../../services/api/user.api";
import { MasterCard } from "../home/MasterCard";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

interface RecommendedMastersPreviewProps {
  intent?: string;
  onViewMasters: () => void;
  onBookFirst: () => void;
  onViewSchedule: (userId: number) => void;
  /** Analytics callback when CTA is clicked */
  onCtaClick?: (cta: "view_masters" | "book_first") => void;
}

// TODO: When backend supports intent filtering, pass intent to findUsers
export const RecommendedMastersPreview: React.FC<
  RecommendedMastersPreviewProps
> = ({ intent, onViewMasters, onBookFirst, onViewSchedule, onCtaClick }) => {
  const [masters, setMasters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await findUsers({ isMaster: true });
        // TODO: Apply intent-based filtering when API supports it
        // For now, take first 6 as "recommended" - honest fallback
        setMasters((res.users || []).slice(0, 6));
      } catch {
        setMasters([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [intent]);

  const handleViewMasters = () => {
    onCtaClick?.("view_masters");
    onViewMasters();
  };

  const handleBookFirst = () => {
    onCtaClick?.("book_first");
    onBookFirst();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground text-sm">Finding masters for you...</p>
      </div>
    );
  }

  return (
    <div
      className="space-y-6 w-full min-w-0"
      data-analytics="onboarding_recommendation_screen"
    >
      <p className="text-sm text-muted-foreground">
        We&apos;re showing top matches based on your preferences. You can refine
        filters anytime.
      </p>

      {masters.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-1">
            {masters.map((master) => (
              <MasterCard
                key={master.id}
                master={master}
                onViewSchedule={(id) => {
                  onCtaClick?.("book_first");
                  onViewSchedule(id);
                }}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full min-w-0">
            <Button
              size="lg"
              className="w-full sm:flex-1 sm:min-w-0"
              onClick={handleBookFirst}
              data-analytics="onboarding_recommendation_cta_clicked"
              data-cta="book_first"
            >
              Book Your First Session
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:flex-1 sm:min-w-0"
              onClick={handleViewMasters}
              data-analytics="onboarding_recommendation_cta_clicked"
              data-cta="view_masters"
            >
              View All Recommended Masters
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No masters available right now. Browse our full list to find one.
          </p>
          <Button onClick={handleViewMasters}>Browse Masters</Button>
        </div>
      )}
    </div>
  );
};
