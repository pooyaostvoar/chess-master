import React from "react";

interface ChessProfileSectionProps {
  title: string | null;
  rating: number | null;
  bio: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
}

export const ChessProfileSection: React.FC<ChessProfileSectionProps> = ({
  title,
  rating,
  bio,
  onChange,
}) => {
  const inputClass =
    "w-full bg-white border border-[#1F1109]/[0.18] rounded-lg px-3.5 py-[11px] text-[13px] text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366]";

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[#1F1109]">Chess profile</h3>
      <div className="space-y-3">
        <div>
          <label htmlFor="title" className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Chess title (optional)</label>
          <select
            id="title"
            name="title"
            value={title || ""}
            onChange={onChange}
            className={inputClass}
          >
            <option value="">No title</option>
            <option value="WCM">WCM - Woman Candidate Master</option>
            <option value="CM">CM - Candidate Master</option>
            <option value="WFM">WFM - Woman FIDE Master</option>
            <option value="FM">FM - FIDE Master</option>
            <option value="WIM">WIM - Woman International Master</option>
            <option value="IM">IM - International Master</option>
            <option value="WGM">WGM - Woman Grandmaster</option>
            <option value="GM">GM - Grandmaster</option>
            <option value="WNM">WNM - Woman National Master</option>
            <option value="NM">NM - National Master</option>
          </select>
        </div>
        <div>
          <label htmlFor="rating" className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Rating (optional)</label>
          <input id="rating" type="number" name="rating" value={rating || ""} onChange={onChange} placeholder="e.g., 2000" className={inputClass} />
        </div>
        <div>
          <label htmlFor="bio" className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Bio (optional)</label>
          <textarea
            id="bio"
            name="bio"
            value={bio || ""}
            onChange={onChange}
            placeholder="Tell us about your chess journey..."
            rows={4}
            className={`${inputClass} resize-y`}
          />
        </div>
      </div>
    </div>
  );
};
