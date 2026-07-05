import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { searchCanonicalLanguages } from "../../constants/languages";

interface LanguageFilterOptionsProps {
  options: string[];
  selected: string;
  allLabel?: string;
  onSelect: (value: string) => void;
  optionClassName?: string;
}

export const LanguageFilterOptions: React.FC<LanguageFilterOptionsProps> = ({
  options,
  selected,
  allLabel = "All languages",
  onSelect,
  optionClassName = "px-3.5 py-2 sm:py-2",
}) => {
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    const matched = searchCanonicalLanguages(search, options);
    return [allLabel, ...matched];
  }, [search, options, allLabel]);

  return (
    <>
      <div className="sticky top-0 bg-white px-3 pt-2 pb-1.5 border-b border-[#1F1109]/[0.06] space-y-1.5">
        <div className="text-sm text-[#8B6F4E] tracking-[0.06em] uppercase">
          Filter by language
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-[#FAF5EB] rounded-md border border-[#1F1109]/[0.08]">
          <Search className="w-3 h-3 text-[#8B6F4E] flex-shrink-0" strokeWidth={2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Search languages"
            className="flex-1 border-none outline-none text-sm bg-transparent text-[#1F1109] min-w-0 font-[inherit] placeholder:text-[#8B6F4E]/60"
          />
        </div>
      </div>

      {filteredOptions.length === 1 && search.trim() ? (
        <div className="px-3.5 py-3 text-sm text-[#8B6F4E]">No languages found</div>
      ) : (
        filteredOptions.map((lang) => {
          const isSelected = selected === lang;
          return (
            <div
              key={lang}
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(lang)}
              className={`${optionClassName} flex justify-between items-center cursor-pointer border-l-2 transition-colors ${
                isSelected
                  ? "bg-[#B8893D]/[0.14] border-l-[#B8893D] pl-3"
                  : "border-l-transparent hover:bg-[#1F1109]/[0.04] active:bg-[#1F1109]/[0.06]"
              }`}
            >
              <span
                className={`text-base text-[#3D2817] ${isSelected ? "font-medium" : ""}`}
              >
                {lang}
              </span>
              {isSelected && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B8893D"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          );
        })
      )}
    </>
  );
};
