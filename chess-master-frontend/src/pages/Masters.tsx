import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Globe, ChevronDown } from "lucide-react";
import { usePageMeta } from "../lib/seo";
import { findUsers } from "../services/auth";
import type { User } from "../services/auth";
import { MasterCard } from "../components/home/MasterCard";
import { LanguageFilterOptions } from "../components/shared/LanguageFilterOptions";
import {
  languageMatchesQuery,
  masterSpeaksLanguage,
  toCanonicalLanguage,
} from "../constants/languages";

/* ─── constants ─── */

const PER_PAGE = 9;

function pageList(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1, total, current - 1, current, current + 1]
    .filter((p, i, all) => p >= 1 && p <= total && all.indexOf(p) === i)
    .sort((a, b) => a - b);
  const list: Array<number | "gap"> = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) list.push("gap");
    list.push(p);
  });
  return list;
}

const TITLE_ORDER = ["GM", "WGM", "IM", "WIM", "FM", "WFM", "CM", "NM"] as const;

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

/* ─── filter dropdown ─── */

interface FilterDropdownProps {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  formatLabel?: (label: string) => string;
  searchable?: boolean;
  searchPool?: string[];
  allLabel?: string;
  /** Shorter chip label used on small screens when nothing is selected. */
  shortLabel?: string;
  /** Share the row equally on small screens. */
  grow?: boolean;
  align?: "start" | "center" | "end";
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  icon,
  formatLabel,
  searchable,
  searchPool,
  allLabel,
  shortLabel,
  grow = false,
  align = "end",
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

  const alignClass =
    align === "start" ? "left-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "right-0";

  return (
    <div className={`relative min-w-0 ${grow ? "shrink sm:shrink-0" : ""}`} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex max-w-full min-w-0 items-center gap-1 border-none rounded-full px-1.5 py-1.5 text-xs font-medium text-[#3D2817] cursor-pointer select-none transition-colors sm:gap-[5px] sm:px-3 sm:text-sm ${
          value ? "bg-[#B8893D]/[0.32] text-[#1F1109]" : "bg-[#B8893D]/[0.12] hover:bg-[#B8893D]/[0.22]"
        }`}
      >
        {icon}
        <span className="truncate">
          {shortLabel && !value ? (
            <>
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{displayLabel}</span>
            </>
          ) : (
            displayLabel
          )}
        </span>
        <ChevronDown
          className={`h-2 w-2 shrink-0 text-[#6B4F1F] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      <div
        className={`absolute top-[calc(100%+6px)] z-50 max-h-64 w-max min-w-[160px] max-w-[min(240px,calc(100vw-2.5rem))] overflow-y-auto rounded-[10px] border border-[#1F1109]/[0.18] bg-white shadow-lg sm:max-h-80 sm:min-w-[180px] ${alignClass} ${
          open ? "block" : "hidden"
        }`}
      >
        {searchable && searchPool ? (
          <LanguageFilterOptions
            options={searchPool}
            selected={value || allLabel || label}
            allLabel={allLabel || label}
            onSelect={(lang) => {
              onChange(lang === (allLabel || label) ? "" : lang);
              setOpen(false);
            }}
            optionClassName="px-3.5 py-2"
          />
        ) : (
          options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`px-3.5 py-2 flex justify-between items-center cursor-pointer border-l-2 transition-colors text-sm ${
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
          })
        )}
      </div>
    </div>
  );
};

/* ─── main page ─── */

const Masters: React.FC = () => {
  usePageMeta({
    title: "Browse chess masters",
    description:
      "Browse verified titled chess masters available for one-on-one sessions. Filter by title, rating, language, and price.",
    canonicalPath: "/masters",
  });
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
  const languagePool = useMemo(() => {
    const counts: Record<string, number> = {};
    masters.forEach((m) =>
      m.languages?.forEach((l) => {
        const canonical = toCanonicalLanguage(l);
        counts[canonical] = (counts[canonical] || 0) + 1;
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([lang]) => lang);
  }, [masters]);

  const languageOptions = useMemo(
    () => [
      { value: "", label: "All languages" },
      ...languagePool.map((l) => ({ value: l, label: l })),
    ],
    [languagePool]
  );

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
        m.languages?.some((l) => languageMatchesQuery(l, s))
      );
    }
    if (language) {
      results = results.filter((m) => masterSpeaksLanguage(m.languages, language));
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
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="text-sm italic text-[#7A2E2E] tracking-[0.04em] mb-2.5"
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
          <p className="text-base text-[#5C4631] leading-relaxed">
            {masters.length} verified titled players available for sessions.
          </p>
        </div>

        {/* Search + filter bar */}
        <div className="mb-4 rounded-xl border border-[#1F1109]/[0.14] bg-white px-3 py-2.5">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 px-2">
              <Search className="w-[13px] h-[13px] shrink-0 text-[#8B6F4E]" strokeWidth={2} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or country"
                className="min-w-0 flex-1 border-none bg-transparent font-[inherit] text-sm text-[#1F1109] outline-none placeholder:text-[#8B6F4E]/60"
              />
            </div>

            <div className="hidden h-[22px] w-px bg-[#1F1109]/[0.12] sm:block" />

            <div className="flex min-w-0 flex-nowrap items-center gap-1 sm:contents sm:gap-1.5">
              <FilterDropdown
                grow
                align="start"
                shortLabel="Language"
                label="All languages"
                value={language}
                options={languageOptions}
                onChange={setLanguage}
                icon={<Globe className="h-[11px] w-[11px] shrink-0 text-[#6B4F1F]" strokeWidth={2} />}
                searchable
                searchPool={languagePool}
                allLabel="All languages"
              />

              <FilterDropdown
                grow
                align="center"
                shortLabel="Title"
                label="Any title"
                value={title}
                options={titleOptions}
                onChange={setTitle}
              />

              <FilterDropdown
                grow
                align="end"
                shortLabel="Rating"
                label="Rating: any"
                value={ratingMin}
                options={RATING_OPTIONS}
                onChange={setRatingMin}
                formatLabel={(l) => `Rating: ${l}`}
              />
            </div>
          </div>
        </div>

        {/* Result count + sort */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm text-[#6B5640]">
            <span className="text-[#1F1109] font-medium">
              {filtered.length} master{filtered.length !== 1 ? "s" : ""}
            </span>{" "}
            matched
          </div>

          <div className="flex items-center gap-1 text-base text-[#5C4631]">
            <span>Sort:</span>
            <FilterDropdown
              label="Top rated"
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={setSortBy}
            />
          </div>
        </div>

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
              <p className="text-sm text-[#6B5640] mb-4">
                Try widening your search or removing a filter.
              </p>
              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-[#B8893D] font-medium hover:underline"
                >
                  Clear all filters →
                </button>
              )}
            </div>
          ) : (
            pageMasters.map((master) => (
              <MasterCard
                key={master.id}
                master={master}
                onViewSchedule={() => {}}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {filtered.length > 0 && totalPages > 1 && (
          <div className="mt-7 flex max-w-full flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#1F1109]/[0.18] text-base text-[#5C4631] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#1F1109]/[0.06] transition-colors"
            >
              ‹
            </button>

            {pageList(currentPage, totalPages).map((p, i) =>
              p === "gap" ? (
                <span key={`gap-${i}`} className="px-1 text-xs text-[#5C4631]">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2.5 rounded-full text-xs transition-colors ${
                    p === currentPage
                      ? "bg-[#3D2817] text-[#F4ECDD] font-medium cursor-default"
                      : "text-[#5C4631] hover:bg-[#1F1109]/[0.06]"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#1F1109]/[0.18] text-base text-[#5C4631] disabled:opacity-30 disabled:cursor-not-allowed hover:enabled:bg-[#1F1109]/[0.06] transition-colors"
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
