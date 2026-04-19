import React, { useState } from "react";
import { FinishedEventsSection } from "../components/event/FinishedEventsSection";
import { Search } from "lucide-react";

const FinishedEvents: React.FC = () => {
  const [searchPhrase, setSearchPhrase] = useState<string>("");

  return (
    <div className="bg-[#FAF5EB] min-h-screen">
      <div className="bg-[#F4ECDD] border-b border-[#1F1109]/[0.08]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div
            className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            From the archive
          </div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[#1F1109] leading-[1.1] tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            Events archive
          </h1>
          <p className="text-[13px] text-[#5C4631] mt-1.5">
            Watch recordings of past master sessions
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-[#8B6F4E]" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search by title or master name..."
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              className="w-full bg-white border border-[#1F1109]/[0.14] rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-[#1F1109] outline-none focus:border-[#B8893D] transition-colors placeholder:text-[#8B6F4E]/60"
            />
          </div>
        </div>
        <FinishedEventsSection limit={null} searchPhrase={searchPhrase || null} />
      </div>
    </div>
  );
};

export default FinishedEvents;
