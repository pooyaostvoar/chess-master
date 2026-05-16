import React from "react";
import { BaseUser } from "@chess-master/schemas";

interface TeachingFocusesProps {
  user: BaseUser;
}

export const TeachingFocuses: React.FC<TeachingFocusesProps> = ({ user }) => {
  const focuses = user.teachingFocuses ?? [];
  if (focuses.length === 0) return null;

  return (
    <div className="pb-2">
      <div className="flex flex-wrap gap-1.5">
        {focuses.map((item) => (
          <span
            key={item}
            className="rounded-full border border-[#1F1109]/[0.12] bg-[#F4ECDD]/60 px-3 py-1 text-xs text-[#3D2817]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
