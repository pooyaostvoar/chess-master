import type { LichessRatings } from "../../../services/api/user.api";

const FIELDS = [
  { key: "classical", label: "Classic" },
  { key: "rapid", label: "Rapid" },
  { key: "blitz", label: "Blitz" },
  { key: "bullet", label: "Bullet" },
] as const;

const inputClass =
  "w-24 bg-white border border-[#1F1109]/[0.18] rounded-md px-2 py-1 text-right text-sm font-medium text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366] placeholder:font-normal";

function parseRating(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function ProfileRatingsFields({
  ratings,
  onChange,
}: {
  ratings: LichessRatings | null;
  onChange: (ratings: LichessRatings | null) => void;
}) {
  const updateRating = (key: string, value: string) => {
    const next: LichessRatings = { ...(ratings ?? {}) };
    const parsed = parseRating(value);
    if (parsed == null) {
      delete next[key];
    } else {
      next[key] = { ...next[key], rating: parsed };
    }
    onChange(Object.keys(next).length > 0 ? next : null);
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {FIELDS.map(({ key, label }) => (
        <div
          key={key}
          className="flex items-center justify-between gap-2 rounded-lg border border-[#1F1109]/[0.08] bg-[#F4ECDD]/30 px-3.5 py-2.5"
        >
          <label
            htmlFor={`profile-rating-${key}`}
            className="text-sm font-medium text-[#1F1109]"
          >
            {label}
          </label>
          <input
            id={`profile-rating-${key}`}
            type="number"
            inputMode="numeric"
            min={0}
            max={4000}
            step={1}
            value={ratings?.[key]?.rating ?? ""}
            onChange={(event) => updateRating(key, event.target.value)}
            placeholder="—"
            aria-label={`${label} rating`}
            className={inputClass}
          />
        </div>
      ))}
    </div>
  );
}
