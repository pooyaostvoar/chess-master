import React, { useState } from "react";

interface TeachingFocusesSectionProps {
  teachingFocuses: string[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export const TeachingFocusesSection: React.FC<TeachingFocusesSectionProps> = ({
  teachingFocuses,
  onChange,
}) => {
  const [input, setInput] = useState("");

  const emitChange = (value: string[]) => {
    onChange({ target: { name: "teachingFocuses", value } } as any);
  };

  const addFocus = (value: string) => {
    const focus = value.trim();
    if (!focus || teachingFocuses.includes(focus)) return;
    emitChange([...teachingFocuses, focus]);
    setInput("");
  };

  const removeFocus = (focus: string) => {
    emitChange(teachingFocuses.filter((item) => item !== focus));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      addFocus(input);
    }
    if (e.key === "Backspace" && !input && teachingFocuses.length) {
      removeFocus(teachingFocuses[teachingFocuses.length - 1]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[#1F1109]">Teaching focuses</h3>
      <div>
        <label className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">
          Topics and skills you teach
        </label>
        <div className="flex items-center gap-1.5 flex-wrap bg-white border border-[#1F1109]/[0.18] rounded-lg px-2.5 py-2 focus-within:border-[#B8893D] transition-colors">
          {teachingFocuses.map((focus) => (
            <span
              key={focus}
              className="flex items-center gap-1 bg-[#B8893D]/[0.14] text-[#6B4F1F] px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap"
            >
              {focus}
              <button
                type="button"
                onClick={() => removeFocus(focus)}
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
            placeholder={
              teachingFocuses.length === 0
                ? "Type a focus area and press comma"
                : ""
            }
            className="flex-1 border-none outline-none p-1 text-[13px] text-[#1F1109] min-w-[120px] bg-transparent placeholder:text-[#9C8366]"
          />
        </div>
      </div>
    </div>
  );
};
