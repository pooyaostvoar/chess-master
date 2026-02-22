import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import type { User } from "../../services/auth";
import { AccountHeader } from "../profile/AccountHeader";

interface MasterCardProps {
  master: User;
  onViewSchedule: (userId: number) => void;
}

export const MasterCard: React.FC<MasterCardProps> = ({
  master,
  onViewSchedule,
}) => {
  return (
    <Card className="group flex flex-col h-full transition-all hover:shadow-md hover:border-primary/20 cursor-default">
      <CardHeader className="flex-1 flex flex-col min-h-0 pb-4">
        {/* Top: Identity — avatar, name (1 line), title, languages (max 3 +N) */}
        <AccountHeader
          user={master}
          maxLanguages={3}
          showVerified
        />

        {/* Middle: Rating + bio — compact, low emphasis */}
        <div className="mt-4 space-y-1">
          {master.rating != null && (
            <p className="text-sm">
              <span className="text-muted-foreground">Rating: </span>
              <span className="font-medium">{master.rating}</span>
            </p>
          )}
          {master.bio && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {master.bio}
            </p>
          )}
        </div>

        {/* Bottom: Price — more prominent */}
        {master.hourlyRate != null && (
          <p className="text-sm font-semibold mt-3">
            From ${master.hourlyRate.toFixed(2)} / 60 min
          </p>
        )}
      </CardHeader>

      {/* CTA — anchored at bottom, single primary action */}
      <CardContent className="pt-0 mt-auto">
        <Button
          className="w-full"
          onClick={() => onViewSchedule(master.id)}
          data-cta="master-card-view-availability"
        >
          View Availability
        </Button>
      </CardContent>
    </Card>
  );
};
