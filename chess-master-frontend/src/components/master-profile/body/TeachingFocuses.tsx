import React from "react";
import { BaseUser } from "@chess-master/schemas";

interface TeachingFocusesProps {
  user: BaseUser;
}

export const TeachingFocuses: React.FC<TeachingFocusesProps> = ({ user }) => {
  const focuses = user.teachingFocuses ?? [];
  if (focuses.length === 0) return null;

  return (
    <section className="px-1 py-1">
      <div className="flex flex-wrap gap-2">
        {focuses.map((item) => (
          <span
            key={item}
            className="rounded-full border border-[#1F1109]/20 bg-[#1F1109] px-3 py-1 text-xs font-medium text-[#F4ECDD]"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
};
