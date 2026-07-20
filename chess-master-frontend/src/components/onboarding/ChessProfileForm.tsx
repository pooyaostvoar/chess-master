import React, { useMemo, useState } from "react";
import { MasterOnboardingStep } from "@chess-master/schemas";
import { Crosshair, LucideIcon, Timer, Trophy, Zap } from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import { updateUser } from "../../services/auth";
import type { LichessRatings } from "../../services/api/user.api";

const inputClass =
  "w-full bg-white border border-[#1F1109]/[0.18] rounded-md px-2 py-1.5 text-center text-sm font-medium text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366] placeholder:font-normal";

const selectClass =
  "w-full bg-white border border-[#1F1109]/[0.18] rounded-md px-3 py-2 text-xs text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE]";

const labelClass = "block text-xs font-medium text-[#3D2817] mb-1";

const RATING_ITEMS: {
  key: "classic" | "rapid" | "blitz" | "bullet";
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "classic", label: "Classic", icon: Trophy },
  { key: "rapid", label: "Rapid", icon: Timer },
  { key: "blitz", label: "Blitz", icon: Zap },
  { key: "bullet", label: "Bullet", icon: Crosshair },
];

type RatingFields = Record<(typeof RATING_ITEMS)[number]["key"], string>;

function buildRatingFields(
  rating?: number | null,
  lichessRatings?: LichessRatings | null
): RatingFields {
  return {
    classic: rating?.toString() ?? "",
    rapid: lichessRatings?.rapid?.rating?.toString() ?? "",
    blitz: lichessRatings?.blitz?.rating?.toString() ?? "",
    bullet: lichessRatings?.bullet?.rating?.toString() ?? "",
  };
}

function parseRating(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildSavePayload(
  ratings: RatingFields,
  existing?: LichessRatings | null
): { rating: number | null; lichessRatings: LichessRatings | null } {
  const rapid = parseRating(ratings.rapid);
  const blitz = parseRating(ratings.blitz);
  const bullet = parseRating(ratings.bullet);

  const lichessRatings: LichessRatings = { ...existing };
  for (const [key, value] of [
    ["rapid", rapid],
    ["blitz", blitz],
    ["bullet", bullet],
  ] as const) {
    if (value == null) {
      delete lichessRatings[key];
      continue;
    }
    lichessRatings[key] = { ...existing?.[key], rating: value };
  }

  return {
    rating: parseRating(ratings.classic),
    lichessRatings: Object.keys(lichessRatings).length > 0 ? lichessRatings : null,
  };
}

export const ChessProfileForm: React.FC = () => {
  const { user, setUser } = useUser();
  const initialRatings = useMemo(
    () => buildRatingFields(user?.rating, user?.lichessRatings),
    [user?.rating, user?.lichessRatings]
  );
  const [ratings, setRatings] = useState(initialRatings);
  const [title, setTitle] = useState(user?.title ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRatingChange = (key: keyof RatingFields, value: string) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { rating, lichessRatings } = buildSavePayload(
      ratings,
      user.lichessRatings
    );

    if (rating == null && !lichessRatings) {
      setError("Please enter at least one rating.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await updateUser(user.id, {
        title: title || null,
        rating,
        lichessRatings,
        onboardingStatus: MasterOnboardingStep.BioAndSections,
      });

      if (data.status === "success") {
        setUser({
          ...user,
          ...data.user,
          title: data.user.title ?? (title || null),
          rating: data.user.rating ?? rating,
          lichessRatings: data.user.lichessRatings ?? lichessRatings,
          onboardingStatus: MasterOnboardingStep.BioAndSections,
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-[#2C2416]">Chess profile</h2>
        <p className="mt-1 text-xs text-[#6B5A42]">
          Add your title and ratings.
        </p>
      </div>

      <div>
        <label htmlFor="title" className={labelClass}>
          Chess title
        </label>
        <select
          id="title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={selectClass}
        >
          <option value="">No title</option>
          <option value="WCM">WCM - Woman Candidate Master</option>
          <option value="CM">CM - Candidate Master</option>
          <option value="WFM">WFM - Woman FIDE Master</option>
          <option value="FM">FM - FIDE Master</option>
          <option value="WIM">WIM - Woman International Master</option>
          <option value="IM">IM - International Master</option>
          <option value="WGM">WGM - Woman Grandmaster</option>
          <option value="GM">GM - Grandmaster</option>
          <option value="WNM">WNM - Woman National Master</option>
          <option value="NM">NM - National Master</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {RATING_ITEMS.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-[#1F1109]/[0.08] bg-[#F4ECDD]/30 px-2 py-2.5"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#B8893D]/20 text-[#B8893D]">
              <Icon className="h-3 w-3" strokeWidth={2} />
            </div>
            <p className="text-[8px] font-medium uppercase tracking-[0.06em] text-[#6B5A42]">
              {label}
            </p>
            <input
              id={`rating-${key}`}
              type="number"
              inputMode="numeric"
              value={ratings[key]}
              onChange={(e) => handleRatingChange(key, e.target.value)}
              placeholder="—"
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-[#7A2E2E]">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#B8893D] text-[#1F1109] px-4 py-2 rounded-full text-xs font-medium hover:bg-[#A67B30] transition-colors disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save and continue"}
      </button>
    </form>
  );
};
