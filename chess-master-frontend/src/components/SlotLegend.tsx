import React from "react";
import { slotStatusCalendarColor } from "../utils/slotUtils";

const SlotLegend: React.FC = () => {
  return (
    <div className="flex gap-6 mt-6 pt-6 border-t border-[#1F1109]/[0.1] justify-center flex-wrap">
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded"
          style={{ background: slotStatusCalendarColor("free") }}
        />
        <span className="text-sm text-[#6B5640]">Available — Click to Book</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded"
          style={{ background: slotStatusCalendarColor("reserved") }}
        />
        <span className="text-sm text-[#6B5640]">Reserved</span>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded"
          style={{ background: slotStatusCalendarColor("booked") }}
        />
        <span className="text-sm text-[#6B5640]">Booked</span>
      </div>
    </div>
  );
};

export default SlotLegend;
