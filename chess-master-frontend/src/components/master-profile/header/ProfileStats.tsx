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

  const containerClassName =
    "flex w-full gap-1.5 lg:grid lg:grid-cols-2 lg:gap-2";
  const itemClassName =
    "flex min-w-0 flex-1 flex-row items-center gap-1.5 rounded-lg border border-[#F4ECDD]/15 bg-[#F4ECDD]/10 px-2 py-1.5 lg:flex-none lg:flex-col lg:items-center lg:justify-center lg:gap-0.5 lg:px-2 lg:py-2 lg:text-center";

  return (
    <div className={containerClassName}>
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className={itemClassName}>
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#B8893D]/20 text-[#B8893D]">
              <Icon className="h-3 w-3" strokeWidth={2} />
            </div>
            <div className="min-w-0 lg:text-center">
              <p
                className="text-sm font-medium leading-none tabular-nums text-[#F4ECDD]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {item.value}
              </p>
              <p className="mt-0.5 text-[8px] font-medium tracking-[0.06em] uppercase text-[#F4ECDD]/65 lg:mt-0.5">
                {item.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
