import React from "react";
import { BaseUser } from "@chess-master/schemas";
import { AboutTabs } from "./AboutTabs";
import { ProfileStats } from "./ProfileStats";
import { TeachingFocuses } from "./TeachingFocuses";

interface MasterProfileBodyProps {
  user: BaseUser;
}

export const MasterProfileBody: React.FC<MasterProfileBodyProps> = ({
  user,
}) => {
  return (
    <section className="min-w-0 rounded-xl bg-white border border-[#1F1109]/[0.12] p-5 md:p-6 space-y-6">
      <ProfileStats user={user} />
      <TeachingFocuses user={user} />
      <AboutTabs user={user} />
    </section>
  );
};
