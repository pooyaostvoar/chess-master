import React from "react";
import { BaseUser } from "@chess-master/schemas";
import { EditPencil, useProfileEdit } from "../edit/ProfileEdit";

interface TeachingFocusesProps {
  user: BaseUser;
}

export const TeachingFocuses: React.FC<TeachingFocusesProps> = ({ user }) => {
  const { pageEditing } = useProfileEdit();
  const focuses = user.teachingFocuses ?? [];

  if (focuses.length === 0 && !pageEditing) return null;

  return (
    <section className="space-y-3">
      {focuses.length === 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[#1F1109]/15 bg-white/70 px-4 py-3">
          <p className="text-sm text-[#6B5640]">Add topics you teach</p>
          <EditPencil id="teaching" label="Edit teaching focuses" withText />
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 px-1 py-1">
          {focuses.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#1F1109]/20 bg-[#1F1109] px-3 py-1 text-xs font-medium text-[#F4ECDD]"
            >
              {item}
            </span>
          ))}
          <EditPencil id="teaching" label="Edit teaching focuses" withText />
        </div>
      )}
    </section>
  );
};
