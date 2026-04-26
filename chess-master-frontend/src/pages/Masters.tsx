import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Globe, ChevronDown } from "lucide-react";
import { findUsers } from "../services/auth";
import type { User } from "../services/auth";
import { MEDIA_URL } from "../services/config";

/* ─── constants ─── */

const PER_PAGE = 9;

const CARD_COLORS = ["#5C3A1E", "#B8893D", "#7A2E2E"] as const;

const TITLE_ORDER = ["GM", "WGM", "IM", "WIM", "FM", "WFM", "CM", "NM"] as const;

const TITLE_TO_PIECE: Record<string, "king" | "queen" | "knight" | "pawn"> = {
  GM: "king", WGM: "king",
  IM: "queen", WIM: "queen",
  FM: "knight", WFM: "knight",
  CM: "pawn", NM: "pawn",
};

const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "1800", label: "1800+" },
  { value: "2000", label: "2000+" },
  { value: "2200", label: "2200+ (FM)" },
  { value: "2400", label: "2400+ (IM)" },
  { value: "2500", label: "2500+ (GM)" },
] as const;

const SORT_OPTIONS = [
  { value: "rating", label: "Top rated" },
  { value: "price-low", label: "Lowest price" },
  { value: "price-high", label: "Highest price" },
] as const;

/* ─── chess piece SVGs ─── */

const PieceSvg: React.FC<{ piece: string; hasPhoto?: boolean }> = ({ piece, hasPhoto }) => {
  if (hasPhoto) return null;

  const paths: Record<string, React.ReactNode> = {
    king: (
      <g fill="#F4ECDD">
        <rect x="21" y="3" width="3" height="9" />
        <rect x="17" y="6" width="11" height="3" />
        <path d="M14 14 c 0 -4 4 -7 8.5 -7 s 8.5 3 8.5 7 v 8 h-17 z" />
        <rect x="13" y="22" width="19" height="3" />
        <path d="M11 25 h23 l-2 9 h-19 z" />
      </g>
    ),
    queen: (
      <g fill="#F4ECDD">
        <circle cx="9" cy="9" r="2" />
        <circle cx="14" cy="6" r="2" />
        <circle cx="22.5" cy="4" r="2" />
        <circle cx="31" cy="6" r="2" />
        <circle cx="36" cy="9" r="2" />
        <path d="M9 11 L36 11 L34 18 L11 18 Z" />
        <rect x="13" y="20" width="19" height="3" />
        <path d="M11 23 h23 l-2 11 h-19 z" />
      </g>
    ),
    knight: (
      <g fill="#F4ECDD" fillRule="evenodd">
        <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
        <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,5.5 16.5,4.5 16.5,4.5 L 18,7 L 18,3.5 L 19.5,2.5 L 21,5.5 L 21,2.5 L 22.5,4 L 22.5,5.5 C 26.5,4.5 30.5,7 32.5,12 L 32.5,16 L 31,17 L 29.5,18 C 29.5,18 27.5,18.5 26.5,18.5 L 24,18 z" />
      </g>
    ),
    pawn: (
      <g fill="#F4ECDD">
        <circle cx="22.5" cy="9" r="5" />
        <path d="M18 14 h9 l-1 5 h-7 z" />
        <path d="M16 19 h13 l-2 9 h-9 z" />
        <rect x="13" y="28" width="19" height="3" />
        <path d="M11 31 h23 l-2 9 h-19 z" />
      </g>
    ),
  };

  return (
    <svg
      viewBox="0 0 45 45"
      width="50"
      height="50"
      className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.08]"
    >
      {paths[piece] || paths.pawn}
    </svg>
  );
};

/* ─── filter dropdown ─── */

interface FilterDropdownProps {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  formatLabel?: (label: string) => string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  icon,
  formatLabel,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("click", close); document.removeEventListener("keydown", esc); };
  }, []);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected
    ? value && formatLabel
      ? formatLabel(selected.label)
      : selected.label
    : label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-[5px] px-3 py-1.5 border-none rounded-full text-[11px] font-medium text-[#3D2817] whitespace-nowrap cursor-pointer select-none transition-colors ${
          value ? "bg-[#B8893D]/[0.32] text-[#1F1109]" : "bg-[#B8893D]/[0.12] hover:bg-[#B8893D]/[0.22]"
        }`}
      >
        {icon}
        <span>{displayLabel}</span>
        <ChevronDown
          className={`w-2 h-2 text-[#6B4F1F] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      <div
        className={`absolute top-[calc(100%+6px)] right-0 min-w-[180px] max-w-[240px] max-h-80 bg-white border border-[#1F1109]/[0.18] rounded-[10px] overflow-y-auto z-50 transition-all duration-150 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <div
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`px-3.5 py-2 flex justify-between items-center cursor-pointer border-l-2 transition-colors text-[13px] ${
                isSelected
                  ? "bg-[#B8893D]/[0.14] border-l-[#B8893D] pl-3 font-medium text-[#1F1109]"
                  : "border-l-transparent text-[#3D2817] hover:bg-[#1F1109]/[0.04]"
              }`}
            >
              <span>{opt.label}</span>
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B8893D" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── main page ─── */

const Masters: React.FC = () => {
  const [masters, setMasters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [language, setLanguage] = useState("");
  const [title, setTitle] = useState("");
  const [ratingMin, setRatingMin] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [page, setPage] = useState(1);

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    findUsers({ isMaster: true })
      .then((res) => setMasters(res.users))
      .catch(() => setError("Failed to load masters"))
      .finally(() => setLoading(false));
  }, []);

  // derive language options from data
  const languageOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    masters.forEach((m) => m.languages?.forEach((l) => { counts[l] = (counts[l] || 0) + 1; }));
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return [
      { value: "", label: "All languages" },
      ...sorted.map(([l]) => ({ value: l, label: l })),
    ];
  }, [masters]);

  // derive title options from data
  const titleOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    masters.forEach((m) => { if (m.title) counts[m.title] = (counts[m.title] || 0) + 1; });
    const ordered = TITLE_ORDER.filter((t) => counts[t]);
    return [
      { value: "", label: "Any title" },
      ...ordered.map((t) => ({ value: t, label: t })),
    ];
  }, [masters]);

  // filtered + sorted
  const filtered = useMemo(() => {
    let results = masters;

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      results = results.filter((m) =>
        m.username.toLowerCase().includes(s) ||
        m.bio?.toLowerCase().includes(s) ||
        m.title?.toLowerCase().includes(s) ||
        m.languages?.some((l) => l.toLowerCase().includes(s))
      );
    }
    if (language) {
      results = results.filter((m) => m.languages?.includes(language));
    }
    if (title) {
      results = results.filter((m) => m.title === title);
    }
    if (ratingMin) {
      const min = parseInt(ratingMin, 10);
      results = results.filter((m) => m.rating && m.rating >= min);
    }

    results = [...results].sort((a, b) => {
      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "price-low") return (a.hourlyRate || 0) - (b.hourlyRate || 0);
      if (sortBy === "price-high") return (b.hourlyRate || 0) - (a.hourlyRate || 0);
      return 0;
    });

    return results;
  }, [masters, searchTerm, language, title, ratingMin, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageMasters = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const hasFilters = searchTerm || language || title || ratingMin;

  const clearAllFilters = () => {
    setSearchTerm("");
    setLanguage("");
    setTitle("");
    setRatingMin("");
    setPage(1);
  };

  const goToPage = (p: number) => {
    setPage(p);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // reset page when filters change
  useEffect(() => { setPage(1); }, [searchTerm, language, title, ratingMin, sortBy]);

  if (loading) {
    return (
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <p className="text-[#7A2E2E]">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF5EB] min-h-screen">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2.5"
            style={{ fontFamily: "Georgia, serif" }}
          >
            The roster
          </div>
          <h1
            className="text-[28px] sm:text-[32px] font-medium text-[#1F1109] leading-[1.1] mb-2.5 tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            Browse all masters
          </h1>
          <p className="text-[13px] text-[#5C4631] leading-relaxed">
            {masters.length} verified titled players available for sessions.
          </p>
        </div>

        {/* Search + filter bar */}
        <div className="bg-white border border-[#1F1109]/[0.14] rounded-xl px-3 py-2.5 flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[180px] px-2">
            <Search className="w-[13px] h-[13px] text-[#8B6F4E] flex-shrink-0" strokeWidth={2} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or country"
              className="flex-1 border-none outline-none text-xs text-[#1F1109] bg-transparent font-[inherit] min-w-0 placeholder:text-[#8B6F4E]/60"
            />
          </div>

          <div className="w-px h-[22px] bg-[#1F1109]/[0.12]" />

          <FilterDropdown
            label="All languages"
            value={language}
            options={languageOptions}
            onChange={setLanguage}
            icon={<Globe className="w-[11px] h-[11px] text-[#6B4F1F]" strokeWidth={2} />}
          />

          <FilterDropdown
            label="Any title"
            value={title}
            options={titleOptions}
            onChange={setTitle}
          />

          <FilterDropdown
            label="Rating: any"
            value={ratingMin}
            options={RATING_OPTIONS}
            onChange={setRatingMin}
            formatLabel={(l) => `Rating: ${l}`}
          />
        </div>

        {/* Result count + sort */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-xs text-[#6B5640]">
            <span className="text-[#1F1109] font-medium">
              {filtered.length} master{filtered.length !== 1 ? "s" : ""}
            </span>{" "}
            matched
          </div>

          <div className="flex items-center gap-1 text-xs text-[#5C4631]">
            <span>Sort:</span>
            <FilterDropdown
              label="Top rated"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={setSortBy}
            />
          </div>
        </div>

        {/* Shared SVG patterns */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <pattern id="brwn1" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="18" height="18" fill="#FAF5EB" fillOpacity="0.05" />
              <rect x="18" y="18" width="18" height="18" fill="#FAF5EB" fillOpacity="0.05" />
            </pattern>
            <pattern id="brwn2" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="18" height="18" fill="#1F1109" fillOpacity="0.06" />
              <rect x="18" y="18" width="18" height="18" fill="#1F1109" fillOpacity="0.06" />
            </pattern>
            <pattern id="brwn3" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="18" height="18" fill="#FAF5EB" fillOpacity="0.05" />
              <rect x="18" y="18" width="18" height="18" fill="#FAF5EB" fillOpacity="0.05" />
            </pattern>
          </defs>
        </svg>

        {/* Master grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {pageMasters.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <h3
                className="text-lg text-[#1F1109] mb-2"
                style={{ fontFamily: "Georgia, serif" }}
              >
                No masters match those filters
              </h3>
              <p className="text-[13px] text-[#6B5640] mb-4">
                Try widening your search or removing a filter.
              </p>
              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[#B8893D] font-medium hover:underline"
                >
                  Clear all filters →
                </button>
              )}
            </div>
          ) : (
            pageMasters.map((master, i) => {
              const colorIdx = i % 3;
              const bg = CARD_COLORS[colorIdx];
              const patternId = ["brwn1", "brwn2", "brwn3"][colorIdx];
              const isGold = colorIdx === 1;
              const piece = TITLE_TO_PIECE[master.title || ""] || "pawn";
              const hasPhoto = !!master.profilePictureThumbnailUrl;

              return (
                <Link
                  key={master.id}
                  to={`/users/${master.id}`}
                  className="group bg-white border border-[#1F1109]/[0.12] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-[#1F1109]/25 hover:-translate-y-0.5"
                >
                  {/* Card header */}
                  <div
                    className="h-[120px] relative flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: bg }}
                  >
                    <svg
                      className="absolute inset-0 w-full h-full"
                      preserveAspectRatio="none"
                    >
                      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
                    </svg>

                    {hasPhoto ? (
                      <img
                        src={MEDIA_URL + master.profilePictureThumbnailUrl}
                        alt={master.username}
                        className="relative w-24 h-24 rounded-full object-cover border-[3px] border-[#F4ECDD]/40"
                      />
                    ) : (
                      <PieceSvg piece={piece} />
                    )}

                    {/* Title badge */}
                    {master.title && (
                      <span
                        className={`absolute top-2 left-2 text-[9px] font-medium px-[7px] py-[3px] rounded tracking-[0.06em] ${
                          isGold
                            ? "bg-[#1F1109]/85 text-[#F4ECDD]"
                            : "bg-[#F4ECDD]/95 text-[#3D2817]"
                        }`}
                      >
                        {master.title}
                      </span>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="px-3 py-[11px] pb-3">
                    <div className="text-xs font-medium text-[#1F1109] mb-0.5 truncate">
                      {master.username}
                    </div>
                    <div className="text-[10px] text-[#6B5640] mb-1.5">
                      {master.rating && <>{master.rating}</>}
                      {master.languages && master.languages.length > 0 && (
                        <>
                          {master.rating && " · "}
                          {master.languages.slice(0, 3).join(" · ")}
                        </>
                      )}
                    </div>

                    {master.bio && (
                      <div className="text-[9px] text-[#6B4F1F] mb-2 truncate">
                        {master.bio}
                      </div>
                    )}

                    {/* Price + View */}
                    <div className="flex justify-between items-baseline pt-[7px] border-t border-[#1F1109]/[0.08]">
                      {master.hourlyRate != null ? (
                        <span className="text-[11px] font-medium text-[#1F1109]">
                          ${master.hourlyRate.toFixed(0)}
                          <span className="text-[#6B5640] font-normal">/hr</span>
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="text-[10px] text-[#B8893D] font-medium">
                        View →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-7">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#1F1109]/[0.18] text-[11px] text-[#5C4631] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#1F1109]/[0.06] transition-colors"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-full text-[11px] transition-colors ${
                  p === currentPage
                    ? "bg-[#3D2817] text-[#F4ECDD] font-medium cursor-default"
                    : "text-[#5C4631] hover:bg-[#1F1109]/[0.06]"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#1F1109]/[0.18] text-[11px] text-[#5C4631] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#1F1109]/[0.06] transition-colors"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Masters;
