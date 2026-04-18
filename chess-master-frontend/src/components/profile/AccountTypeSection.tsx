import React from "react";

interface AccountTypeSectionProps {
  isMaster: boolean;
  onChange: (isMaster: boolean) => void;
}

export const AccountTypeSection: React.FC<AccountTypeSectionProps> = ({
  isMaster,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[#1F1109]">Account type</h3>
      <label className="flex items-center gap-2.5 p-4 bg-[#F4ECDD]/50 border border-[#1F1109]/[0.08] rounded-lg cursor-pointer select-none">
        <input
          type="checkbox"
          id="isMaster"
          name="isMaster"
          checked={!!isMaster}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 accent-[#B8893D] rounded"
        />
        <span className="text-[13px] text-[#3D2817]">
          I am a chess master and want to offer coaching sessions
        </span>
      </label>
    </div>
  );
};
