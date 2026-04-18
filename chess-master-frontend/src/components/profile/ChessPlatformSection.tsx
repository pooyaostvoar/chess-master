import React from "react";

interface ChessPlatformSectionProps {
  chesscomUrl: string | null;
  lichessUrl: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export const ChessPlatformSection: React.FC<ChessPlatformSectionProps> = ({
  chesscomUrl,
  lichessUrl,
  onChange,
}) => {
  const inputClass =
    "w-full bg-white border border-[#1F1109]/[0.18] rounded-lg px-3.5 py-[11px] text-[13px] text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366]";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[#1F1109]">Chess platform profiles</h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="chesscomUrl" className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Chess.com username/URL (optional)</label>
          <input id="chesscomUrl" type="text" name="chesscomUrl" value={chesscomUrl || ""} onChange={onChange} placeholder="e.g., username or https://www.chess.com/member/username" className={inputClass} />
        </div>
        <div>
          <label htmlFor="lichessUrl" className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Lichess username/URL (optional)</label>
          <input id="lichessUrl" type="text" name="lichessUrl" value={lichessUrl || ""} onChange={onChange} placeholder="e.g., username or https://lichess.org/@/username" className={inputClass} />
        </div>
      </div>
    </div>
  );
};
