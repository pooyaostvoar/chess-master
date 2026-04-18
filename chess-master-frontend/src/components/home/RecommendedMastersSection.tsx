import React from "react";
import { Card, CardContent } from "../ui/card";
import { MasterCard } from "./MasterCard";
import type { User } from "../../services/auth";

interface RecommendedMastersSectionProps {
  masters: User[];
  loading: boolean;
  onViewSchedule: (userId: number) => void;
}

export const RecommendedMastersSection: React.FC<
  RecommendedMastersSectionProps
> = ({ masters, loading, onViewSchedule }) => {
  return (
    <>
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
        </div>
      ) : masters.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No masters available at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {masters.map((master) => (
            <MasterCard
              key={master.id}
              master={master}
              onViewSchedule={onViewSchedule}
            />
          ))}
        </div>
      )}
    </>
  );
};
