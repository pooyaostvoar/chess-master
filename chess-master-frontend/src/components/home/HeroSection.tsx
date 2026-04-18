import React, { useRef, useEffect, useState } from "react";
import { Search, Globe, ChevronDown } from "lucide-react";

const TOPIC_TAGS = [
  "Openings",
  "Endgames",
  "Tactics",
  "Blitz training",
  "Tournament prep",
  "Beginner-friendly",
] as const;

const LANGUAGES = [
  "All languages",
  "English",
  "German",
  "Persian",
  "Dutch",
  "Estonian",
] as const;

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedLang: string;
  onLangChange: (lang: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  selectedLang,
  onLangChange,
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLangOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleTagClick = (tag: string) => {
    onSearchChange(searchQuery === tag ? "" : tag);
  };

  return (
    <div className="bg-[#F4ECDD] relative overflow-hidden" style={{ minHeight: 460 }}>
      {/* Checkerboard pattern */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="hero-checker"
            x="0"
            y="0"
            width="180"
            height="180"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="90" height="90" fill="#3D2817" fillOpacity="0.045" />
            <rect x="90" y="90" width="90" height="90" fill="#3D2817" fillOpacity="0.045" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-checker)" />
      </svg>

      {/* Animated knight */}
      <svg
        viewBox="0 0 45 45"
        className="absolute left-0 top-0 w-[50px] h-[50px] pointer-events-none opacity-[0.18] animate-[knightTour_32s_infinite_cubic-bezier(0.65,0,0.35,1)]"
      >
        <g fill="#3D2817" fillRule="evenodd">
          <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
          <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,5.5 16.5,4.5 16.5,4.5 L 18,7 L 18,3.5 L 19.5,2.5 L 21,5.5 L 21,2.5 L 22.5,4 L 22.5,5.5 C 26.5,4.5 30.5,7 32.5,12 L 32.5,16 L 31,17 L 29.5,18 C 29.5,18 27.5,18.5 26.5,18.5 L 24,18 z" />
        </g>
      </svg>

      <div className="relative px-5 sm:px-10 py-14 sm:py-16 text-center max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#B8893D]/20 rounded-full text-[11px] text-[#6B4F1F] mb-6 tracking-wide">
          <span className="w-[5px] h-[5px] bg-[#B8893D] rounded-full" />
          Verified titled players from 40+ countries
        </div>

        {/* Headline */}
        <h1
          className="text-3xl sm:text-4xl md:text-[40px] font-medium leading-[1.08] mb-4 text-[#1F1109] tracking-[-0.015em]"
          style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
        >
          Find a chess master
          <br />
          who fits your{" "}
          <span className="italic text-[#7A2E2E] font-normal">game</span>
        </h1>

        {/* Subtext */}
        <p className="text-sm text-[#5C4631] mb-7 max-w-[460px] mx-auto leading-relaxed">
          One-on-one lessons, game reviews, and live training from the players
          who've actually played the openings you're studying.
        </p>

        {/* Search bar */}
        <div className="bg-white border border-[#1F1109]/[0.16] rounded-full py-[5px] pl-4 sm:pl-[18px] pr-[5px] flex items-center max-w-[580px] mx-auto mb-6">
          <Search className="w-[14px] h-[14px] text-[#8B6F4E] flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Try "Sicilian Defense" or a master name'
            className="flex-1 border-none outline-none text-[13px] px-2.5 py-2 bg-transparent text-[#1F1109] min-w-0 font-[inherit] placeholder:text-[#8B6F4E]/60"
          />

          <div className="w-px h-[22px] bg-[#1F1109]/[0.14] mx-1" />

          {/* Language dropdown */}
          <div className="relative mr-1.5" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B8893D]/[0.12] rounded-full cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#B8893D]/40"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
            >
              <Globe className="w-[13px] h-[13px] text-[#6B4F1F]" strokeWidth={2} />
              <span className="text-xs text-[#3D2817] font-medium whitespace-nowrap flex items-center gap-1">
                {selectedLang !== "All languages" && (
                  <span className="inline-block w-[5px] h-[5px] bg-[#B8893D] rounded-full" />
                )}
                {selectedLang}
              </span>
              <ChevronDown
                className={`w-[9px] h-[9px] text-[#6B4F1F] transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`}
                strokeWidth={2.5}
              />
            </button>

            {/* Dropdown */}
            <div
              className={`absolute top-[calc(100%+8px)] right-0 w-60 bg-white border border-[#1F1109]/[0.18] rounded-[10px] overflow-hidden z-50 text-left transition-all duration-150 ${
                langOpen
                  ? "opacity-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 -translate-y-1 pointer-events-none"
              }`}
              role="listbox"
            >
              <div className="px-3 pt-2 pb-1.5 text-[10px] text-[#8B6F4E] tracking-[0.06em] uppercase">
                Filter by language
              </div>
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang;
                return (
                  <div
                    key={lang}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onLangChange(lang);
                      setLangOpen(false);
                    }}
                    className={`px-3.5 py-2 flex justify-between items-center cursor-pointer border-l-2 transition-colors ${
                      isSelected
                        ? "bg-[#B8893D]/[0.14] border-l-[#B8893D] pl-3"
                        : "border-l-transparent hover:bg-[#1F1109]/[0.04]"
                    }`}
                  >
                    <span className={`text-[13px] text-[#3D2817] ${isSelected ? "font-medium" : ""}`}>
                      {lang}
                    </span>
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

          {/* Clear button when search is active */}
          {(searchQuery || selectedLang !== "All languages") && (
            <button
              onClick={() => {
                onSearchChange("");
                onLangChange("All languages");
              }}
              className="text-[11px] text-[#6B5640] mr-2 hover:text-[#1F1109] transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}

          <button className="bg-[#B8893D] text-white px-5 py-2.5 rounded-full font-medium text-[13px] whitespace-nowrap hover:bg-[#A67B30] transition-colors">
            Search
          </button>
        </div>

        {/* Topic tags */}
        <div className="flex flex-wrap justify-center gap-2 max-w-[540px] mx-auto">
          {TOPIC_TAGS.map((tag) => {
            const isActive = searchQuery.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3.5 py-1.5 border rounded-full text-xs transition-colors ${
                  isActive
                    ? "bg-[#B8893D]/20 border-[#B8893D]/40 text-[#3D2817] font-medium"
                    : "bg-white/85 border-[#1F1109]/[0.12] text-[#3D2817] hover:bg-white hover:border-[#B8893D]/30"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
