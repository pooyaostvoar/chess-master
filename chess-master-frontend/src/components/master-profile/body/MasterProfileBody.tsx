import React from "react";
import { BaseUser } from "@chess-master/schemas";
import { AboutTabs } from "./AboutTabs";
import { YoutubeVideos } from "./YoutubeVideos";

interface MasterProfileBodyProps {
  user: BaseUser;
}

export const MasterProfileBody: React.FC<MasterProfileBodyProps> = ({
  user,
}) => {
  return (
    <section className="min-w-0 rounded-xl bg-white border border-[#1F1109]/[0.12] p-5 md:p-6 space-y-6">
      <AboutTabs user={user} />
      <YoutubeVideos user={user} />
    </section>
  );
};
