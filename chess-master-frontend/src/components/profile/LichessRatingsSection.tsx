import React from "react";
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
  "classical", "rapid", "blitz", "bullet", "correspondence", "chess960",
  "threeCheck", "atomic", "horde", "kingOfTheHill", "racingKings",
  "antichess", "ultraBullet", "puzzle",
];

const normalizeUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

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
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-medium text-[#1F1109]">Imported from Lichess</h3>
          <p className="text-[11px] text-[#6B5640] mt-0.5">
            Ratings are read-only and synced from the connected Lichess account.
          </p>
        </div>
        {lichessUrl && (
          <a
            href={normalizeUrl(lichessUrl)}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-medium text-[#B8893D] hover:underline"
          >
            View Lichess profile →
          </a>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {entries.map(([variant, perf]) => (
          <div
            key={variant}
            className="border border-[#1F1109]/[0.08] rounded-lg bg-[#F4ECDD]/30 px-3.5 py-2.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-medium text-[#1F1109]">
                {VARIANT_LABELS[variant] ?? variant}
              </span>
              <span className="text-base font-medium text-[#1F1109]">{perf.rating}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap text-[11px] text-[#6B5640]">
              {typeof perf.games === "number" && <span>{perf.games} games</span>}
              {perf.prov && (
                <span className="bg-[#B8893D]/[0.14] text-[#6B4F1F] px-2 py-0.5 rounded-full text-[10px]">
                  Provisional
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
