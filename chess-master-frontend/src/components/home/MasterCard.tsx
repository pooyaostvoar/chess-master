import React from "react";
import { Link } from "react-router-dom";
import type { User } from "../../services/auth";
import { MEDIA_URL } from "../../services/config";

interface MasterCardProps {
  master: User;
  onViewSchedule: (userId: number) => void;
}

const HEADER_COLORS = [
  "#5C3A1E",
  "#B8893D",
  "#7A2E2E",
  "#3D5C1E",
  "#2E4A7A",
  "#6B4F1F",
  "#8B3A3A",
  "#4A6741",
] as const;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getHeaderColor(id: number): string {
  return HEADER_COLORS[id % HEADER_COLORS.length];
}

export const MasterCard: React.FC<MasterCardProps> = ({
  master,
  onViewSchedule,
}) => {
  const headerBg = getHeaderColor(master.id);
  const initials = getInitials(master.username);
  const isLightBg = headerBg === "#B8893D";

  return (
    <Link
      to={`/users/${master.id}`}
      className="block bg-white border border-[#1F1109]/[0.12] rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
    >
      {/* Header with avatar/initials */}
      <div
        className="h-28 relative flex items-center justify-center"
        style={{ backgroundColor: headerBg }}
      >
        {master.profilePictureThumbnailUrl ? (
          <img
            src={MEDIA_URL + master.profilePictureThumbnailUrl}
            alt={master.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className="text-4xl font-medium tracking-[-0.02em]"
            style={{
              fontFamily: "Georgia, serif",
              color: isLightBg ? "#FAF5EB" : "#F4ECDD",
            }}
          >
            {initials}
          </span>
        )}

        {/* Title badge (GM, IM, FM, etc.) */}
        {master.title && (
          <span
            className={`absolute top-2 left-2 text-[9px] font-medium px-1.5 py-0.5 rounded tracking-[0.06em] ${
              isLightBg
                ? "bg-[#1F1109]/85 text-[#F4ECDD]"
                : "bg-[#F4ECDD]/95 text-[#3D2817]"
            }`}
          >
            {master.title}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-3.5 py-3 pb-3.5">
        <div className="text-[13px] font-medium text-[#1F1109] mb-0.5">
          {master.username}
        </div>

        <div className="text-[11px] text-[#6B5640] mb-2">
          {master.rating && <>{master.rating} Elo</>}
          {master.languages && master.languages.length > 0 && (
            <>
              {master.rating && " · "}
              {master.languages.slice(0, 2).join(", ")}
            </>
          )}
        </div>

        {/* Specialty tag from bio */}
        {master.bio && (
          <span className="inline-block text-[10px] text-[#6B4F1F] bg-[#B8893D]/[0.16] px-2 py-0.5 rounded mb-2.5 line-clamp-1">
            {master.bio.length > 30 ? master.bio.slice(0, 30) + "…" : master.bio}
          </span>
        )}

        {/* Price */}
        {master.hourlyRate != null && (
          <div className="flex justify-between items-baseline pt-2 border-t border-[#1F1109]/[0.08]">
            <span className="text-[11px] text-[#6B5640]">From</span>
            <span className="text-[13px] font-medium text-[#1F1109]">
              ${master.hourlyRate.toFixed(0)}
              <span className="text-[10px] text-[#6B5640] font-normal"> / hour</span>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};
