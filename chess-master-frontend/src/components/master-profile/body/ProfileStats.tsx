import React from "react";
import { BaseUser } from "@chess-master/schemas";
import { GraduationCap, LucideIcon, Timer, Trophy, Zap } from "lucide-react";

interface ProfileStatsProps {
  user: BaseUser;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ user }) => {
  const studentsLabel = user.studentsCount ?? 0;

  const stats: {
    label: string;
    value: string | number | null | undefined;
    icon: LucideIcon;
  }[] = [
    { label: "FIDE", value: user.rating, icon: Trophy },
    { label: "Rapid", value: user.lichessRatings?.rapid?.rating, icon: Timer },
    { label: "Blitz", value: user.lichessRatings?.blitz?.rating, icon: Zap },
    {
      label: "Students",
      value: studentsLabel ? `${studentsLabel}+` : null,
      icon: GraduationCap,
    },
  ].filter((s) => s.value != null && s.value !== "");

  if (stats.length === 0) return null;

  const gridClass =
    stats.length === 1
      ? "grid-cols-1"
      : stats.length === 2
        ? "grid-cols-2"
        : stats.length === 3
          ? "grid-cols-3"
          : "grid-cols-2 md:grid-cols-4";

  return (
    <div className={`grid gap-2 md:gap-3 ${gridClass}`}>
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="flex items-center gap-2.5 rounded-lg border border-[#1F1109]/[0.08] bg-[#FAF5EB]/60 px-2.5 py-2 md:px-3 md:py-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#B8893D]/15 text-[#B8893D]">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <div
                className="text-base md:text-2xl font-medium text-[#1F1109] leading-none"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {item.value}
              </div>
              <div className="mt-1 text-[10px] md:text-[11px] tracking-[0.04em] uppercase text-[#6B5640]">
                {item.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
