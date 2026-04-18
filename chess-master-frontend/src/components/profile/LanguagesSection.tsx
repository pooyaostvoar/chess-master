import React, { useState } from "react";

interface LanguagesSectionProps {
  name: string;
  languages: string[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({
  name,
  languages,
  onChange,
}) => {
  const [input, setInput] = useState("");

  const emitChange = (value: string[]) => {
    onChange({ target: { name, value } } as any);
  };

  const addLanguage = (value: string) => {
    const lang = value.trim();
    if (!lang || languages.includes(lang)) return;
    emitChange([...languages, lang]);
    setInput("");
  };

  const removeLanguage = (lang: string) => {
    emitChange(languages.filter((l) => l !== lang));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addLanguage(input);
    }
    if (e.key === "Backspace" && !input && languages.length) {
      removeLanguage(languages[languages.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[#1F1109]">Languages</h3>
      <div>
        <label className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Languages you speak</label>
        <div className="flex items-center gap-1.5 flex-wrap bg-white border border-[#1F1109]/[0.18] rounded-lg px-2.5 py-2 focus-within:border-[#B8893D] transition-colors">
          {languages.map((lang) => (
            <span
              key={lang}
              className="flex items-center gap-1 bg-[#B8893D]/[0.14] text-[#6B4F1F] px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap"
            >
              {lang}
              <button
                type="button"
                onClick={() => removeLanguage(lang)}
                className="text-[10px] text-[#6B4F1F] hover:text-[#7A2E2E] transition-colors ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={languages.length === 0 ? "Type a language and press comma" : ""}
            className="flex-1 border-none outline-none p-1 text-[13px] text-[#1F1109] min-w-[120px] bg-transparent placeholder:text-[#9C8366]"
          />
        </div>
      </div>
    </div>
  );
};
