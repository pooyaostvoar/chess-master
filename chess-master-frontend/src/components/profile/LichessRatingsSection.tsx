import React from "react";
import { Badge } from "../ui/badge";
import type { User } from "../../services/auth";

type LichessRatings = NonNullable<User["lichessRatings"]>;

interface LichessRatingsSectionProps {
  lichessRatings?: User["lichessRatings"];
  lichessUrl?: string | null;
}

const VARIANT_LABELS: Record<string, string> = {
  ultraBullet: "UltraBullet",
  bullet: "Bullet",
  blitz: "Blitz",
  rapid: "Rapid",
  classical: "Classical",
  correspondence: "Correspondence",
  chess960: "Chess960",
  kingOfTheHill: "King of the Hill",
  threeCheck: "Three-check",
  antichess: "Antichess",
  atomic: "Atomic",
  horde: "Horde",
  racingKings: "Racing Kings",
  puzzle: "Puzzle",
};

const DISPLAY_ORDER = [
  "classical",
  "rapid",
  "blitz",
  "bullet",
  "correspondence",
  "chess960",
  "threeCheck",
  "atomic",
  "horde",
  "kingOfTheHill",
  "racingKings",
  "antichess",
  "ultraBullet",
  "puzzle",
];

const normalizeUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `https://${url}`;

const getVariantRank = (variant: string) => {
  const index = DISPLAY_ORDER.indexOf(variant);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const getSortedEntries = (ratings: LichessRatings) => {
  return Object.entries(ratings).sort(([a], [b]) => {
    const rankDiff = getVariantRank(a) - getVariantRank(b);
    return rankDiff !== 0 ? rankDiff : a.localeCompare(b);
  });
};

export const LichessRatingsSection: React.FC<LichessRatingsSectionProps> = ({
  lichessRatings,
  lichessUrl,
}) => {
  if (!lichessRatings || Object.keys(lichessRatings).length === 0) {
    return null;
  }

  const entries = getSortedEntries(lichessRatings);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-xl font-semibold">Imported from Lichess</h3>
          <p className="text-sm text-muted-foreground">
            Ratings are read-only and synced from the connected Lichess account.
          </p>
        </div>
        {lichessUrl && (
          <a
            href={normalizeUrl(lichessUrl)}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            View Lichess profile
          </a>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {entries.map(([variant, perf]) => (
          <div
            key={variant}
            className="rounded-lg border bg-card px-4 py-3 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">
                {VARIANT_LABELS[variant] ?? variant}
              </span>
              <span className="text-lg font-semibold">{perf.rating}</span>
            </div>

            <div className="mt-2 flex items-center gap-2 flex-wrap text-sm text-muted-foreground">
              {typeof perf.games === "number" && <span>{perf.games} games</span>}
              {perf.prov && <Badge variant="secondary">Provisional</Badge>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
