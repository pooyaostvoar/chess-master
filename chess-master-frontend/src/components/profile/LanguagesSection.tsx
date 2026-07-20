import React, { useMemo, useState } from "react";
import {
  searchCanonicalLanguages,
  toCanonicalLanguage,
} from "../../constants/languages";

interface LanguagesSectionProps {
  name: string;
  languages: string[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  compact?: boolean;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  name,
  languages,
  onChange,
  compact = false,
}) => {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const canonicalLanguages = useMemo(
    () => languages.map(toCanonicalLanguage),
    [languages]
  );

  const suggestions = useMemo(() => {
    if (!input.trim()) return [];
    return searchCanonicalLanguages(input).filter(
      (lang) => !canonicalLanguages.includes(lang)
    );
  }, [input, canonicalLanguages]);

  const emitChange = (value: string[]) => {
    onChange({ target: { name, value } } as any);
  };

  const addLanguage = (value: string) => {
    const lang = toCanonicalLanguage(value);
    if (!lang || canonicalLanguages.includes(lang)) return;
    emitChange([...canonicalLanguages, lang]);
    setInput("");
    setShowSuggestions(false);
  };

  const removeLanguage = (lang: string) => {
    emitChange(canonicalLanguages.filter((l) => l !== lang));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length === 1) {
        addLanguage(suggestions[0]);
      } else {
        addLanguage(input);
      }
    }
    if (e.key === "Backspace" && !input && canonicalLanguages.length) {
      removeLanguage(canonicalLanguages[canonicalLanguages.length - 1]);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={compact ? "space-y-1" : "space-y-3"}>
      {!compact && (
        <h3 className="text-sm font-medium text-[#1F1109]">Languages</h3>
      )}
      <div className="relative">
        <label
          className={
            compact
              ? "block text-xs font-medium text-[#3D2817] mb-1"
              : "block text-sm font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]"
          }
        >
          Languages you speak
        </label>
        <div
          className={`flex items-center gap-1.5 flex-wrap bg-white border border-[#1F1109]/[0.18] focus-within:border-[#B8893D] transition-colors ${
            compact
              ? "rounded-md px-2 py-1.5"
              : "rounded-lg px-2.5 py-2"
          }`}
        >
          {canonicalLanguages.map((lang) => (
            <span
              key={lang}
              className="flex items-center gap-1 bg-[#B8893D]/[0.14] text-[#6B4F1F] px-2.5 py-1 rounded-full text-xs whitespace-nowrap"
            >
              {lang}
              <button
                type="button"
                onClick={() => removeLanguage(lang)}
                className="text-xs text-[#6B4F1F] hover:text-[#7A2E2E] transition-colors ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder={canonicalLanguages.length === 0 ? "Type a language and press comma" : ""}
            className={`flex-1 border-none outline-none p-1 min-w-[120px] bg-transparent placeholder:text-[#9C8366] ${
              compact ? "text-xs text-[#1F1109]" : "text-sm text-[#1F1109]"
            }`}
          />
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#1F1109]/[0.18] rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
            {suggestions.map((lang) => (
              <button
                key={lang}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addLanguage(lang)}
                className={`w-full text-left px-3 py-2 text-[#3D2817] hover:bg-[#1F1109]/[0.04] transition-colors ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
