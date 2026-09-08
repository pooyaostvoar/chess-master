import React from "react";
import type { User } from "../../services/auth";

type LichessRatings = NonNullable<User["lichessRatings"]>;

interface LichessRatingsSectionProps {
  lichessRatings?: User["lichessRatings"];
  lichessUrl?: string | null;
  editable?: boolean;
  onChange?: (ratings: User["lichessRatings"]) => void;
}

const VARIANT_LABELS: Record<string, string> = {
  ultraBullet: "UltraBullet",
  bullet: "Bullet",
  blitz: "Blitz",
  rapid: "Rapid",
  classical: "Classic",
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

const EDITABLE_DEFAULT_VARIANTS = ["classical", "rapid", "blitz", "bullet"];

const normalizeUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

const getVariantRank = (variant: string) => {
  const index = DISPLAY_ORDER.indexOf(variant);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

const getDisplayVariants = (
  ratings: LichessRatings | null | undefined,
  editable: boolean
) => {
  const keys = new Set(Object.keys(ratings ?? {}));
  if (editable) {
    for (const variant of EDITABLE_DEFAULT_VARIANTS) keys.add(variant);
  }
  return Array.from(keys).sort((a, b) => {
    const rankDiff = getVariantRank(a) - getVariantRank(b);
    return rankDiff !== 0 ? rankDiff : a.localeCompare(b);
  });
};

const parseRating = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const ratingInputClass =
  "w-24 bg-white border border-[#1F1109]/[0.18] rounded-md px-2 py-1 text-right text-sm font-medium text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366] placeholder:font-normal";

export const LichessRatingsSection: React.FC<LichessRatingsSectionProps> = ({
  lichessRatings,
  lichessUrl,
  editable = false,
  onChange,
}) => {
  const hasRatings = Boolean(lichessRatings && Object.keys(lichessRatings).length > 0);
  if (!editable && !hasRatings) {
    return null;
  }

  const variants = getDisplayVariants(lichessRatings, editable);

  const handleRatingChange = (variant: string, value: string) => {
    if (!onChange) return;
    const next: LichessRatings = { ...(lichessRatings ?? {}) };
    const parsed = parseRating(value);
    if (parsed == null) {
      delete next[variant];
    } else {
      next[variant] = { ...next[variant], rating: parsed };
    }
    onChange(Object.keys(next).length > 0 ? next : null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-medium text-[#1F1109]">
            {editable ? "Ratings" : "Imported from Lichess"}
          </h3>
          <p className="text-sm text-[#6B5640] mt-0.5">
            {editable
              ? "Edit your ratings here. Connecting Lichess will overwrite them with the latest from your account."
              : "Ratings are read-only and synced from the connected Lichess account."}
          </p>
        </div>
        {lichessUrl && (
          <a
            href={normalizeUrl(lichessUrl)}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-[#B8893D] hover:underline"
          >
            View Lichess profile →
          </a>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {variants.map((variant) => {
          const perf = lichessRatings?.[variant];
          const label = VARIANT_LABELS[variant] ?? variant;
          return (
            <div
              key={variant}
              className="border border-[#1F1109]/[0.08] rounded-lg bg-[#F4ECDD]/30 px-3.5 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                {editable ? (
                  <label
                    htmlFor={`lichess-rating-${variant}`}
                    className="text-sm font-medium text-[#1F1109]"
                  >
                    {label}
                  </label>
                ) : (
                  <span className="text-sm font-medium text-[#1F1109]">{label}</span>
                )}
                {editable ? (
                  <input
                    id={`lichess-rating-${variant}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={4000}
                    step={1}
                    value={perf?.rating ?? ""}
                    onChange={(e) => handleRatingChange(variant, e.target.value)}
                    placeholder="—"
                    aria-label={`${label} rating`}
                    className={ratingInputClass}
                  />
                ) : (
                  <span className="text-base font-medium text-[#1F1109]">
                    {perf?.rating}
                  </span>
                )}
              </div>
              {(typeof perf?.games === "number" || perf?.prov) && (
                <div className="mt-1 flex items-center gap-2 flex-wrap text-sm text-[#6B5640]">
                  {typeof perf?.games === "number" && <span>{perf.games} games</span>}
                  {perf?.prov && (
                    <span className="bg-[#B8893D]/[0.14] text-[#6B4F1F] px-2 py-0.5 rounded-full text-xs">
                      Provisional
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
