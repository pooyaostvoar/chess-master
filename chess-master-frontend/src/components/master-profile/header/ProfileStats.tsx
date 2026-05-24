import React from "react";
import { BaseUser } from "@chess-master/schemas";
import { Crosshair, LucideIcon, Timer, Trophy, Zap } from "lucide-react";

interface ProfileStatsProps {
  user: BaseUser;
}

export function hasProfileStats(user: BaseUser): boolean {
  return [
    user.rating,
    user.lichessRatings?.rapid?.rating,
    user.lichessRatings?.blitz?.rating,
    user.lichessRatings?.bullet?.rating,
  ].some((value) => value != null);
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ user }) => {
  const stats: {
    label: string;
    value: string | number | null | undefined;
    icon: LucideIcon;
  }[] = [
    { label: "Classic", value: user.rating, icon: Trophy },
    { label: "Rapid", value: user.lichessRatings?.rapid?.rating, icon: Timer },
    { label: "Blitz", value: user.lichessRatings?.blitz?.rating, icon: Zap },
    {
      label: "Bullet",
      value: user.lichessRatings?.bullet?.rating,
      icon: Crosshair,
    },
  ].filter((s) => s.value != null);

  if (stats.length === 0) return null;

  return (
    <div className="grid w-full grid-cols-2 gap-1.5 md:gap-2">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center gap-0.5 rounded-lg border border-[#F4ECDD]/15 bg-[#F4ECDD]/10 px-2 py-2 text-center"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#B8893D]/20 text-[#B8893D]">
              <Icon className="h-3 w-3" strokeWidth={2} />
            </div>
            <div
              className="text-sm font-medium leading-none tabular-nums text-[#F4ECDD]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {item.value}
            </div>
            <div className="text-[8px] font-medium tracking-[0.06em] uppercase text-[#F4ECDD]/65">
              {item.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
