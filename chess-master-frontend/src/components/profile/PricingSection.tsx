import React, { useState } from "react";

interface PricingSectionProps {
  pricing: number;
  onPricingChange: (value: number | null) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  pricing,
  onPricingChange,
}) => {
  const [inputValue, setInputValue] = useState(pricing?.toString() || "");

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[#1F1109]">Session pricing</h3>
      <p className="text-[11px] text-[#6B5640]">Set your hourly rate.</p>
      <div className="border border-[#1F1109]/[0.12] rounded-lg p-4 bg-[#F4ECDD]/30">
        <label className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]">Hourly rate</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#8B6F4E]">$</span>
          <input
            type="number"
            name="hourlyRate"
            value={inputValue}
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
              const numValue = value === "" ? null : parseFloat(value);
              onPricingChange(numValue);
            }}
            placeholder="0.00"
            step="0.01"
            className="w-full bg-white border border-[#1F1109]/[0.18] rounded-lg pl-8 pr-3.5 py-[11px] text-[13px] text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366]"
          />
        </div>
        {pricing != null && pricing > 0 && (
          <p className="text-[11px] text-[#6B5640] mt-2">${pricing} per hour</p>
        )}
      </div>
    </div>
  );
};
