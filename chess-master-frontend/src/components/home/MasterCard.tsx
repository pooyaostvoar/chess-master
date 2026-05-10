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
] as const;

const TITLE_TO_PIECE: Record<string, "king" | "queen" | "knight" | "pawn"> = {
  GM: "king",
  WGM: "king",
  IM: "queen",
  WIM: "queen",
  FM: "knight",
  WFM: "knight",
  CM: "pawn",
  NM: "pawn",
};

function getHeaderColor(id: number): string {
  return HEADER_COLORS[id % HEADER_COLORS.length];
}

const PieceSvg: React.FC<{ piece: string }> = ({ piece }) => {
  const paths: Record<string, React.ReactNode> = {
    king: (
      <g fill="#F4ECDD">
        <rect x="21" y="3" width="3" height="9" />
        <rect x="17" y="6" width="11" height="3" />
        <path d="M14 14 c 0 -4 4 -7 8.5 -7 s 8.5 3 8.5 7 v 8 h-17 z" />
        <rect x="13" y="22" width="19" height="3" />
        <path d="M11 25 h23 l-2 9 h-19 z" />
      </g>
    ),
    queen: (
      <g fill="#F4ECDD">
        <circle cx="9" cy="9" r="2" />
        <circle cx="14" cy="6" r="2" />
        <circle cx="22.5" cy="4" r="2" />
        <circle cx="31" cy="6" r="2" />
        <circle cx="36" cy="9" r="2" />
        <path d="M9 11 L36 11 L34 18 L11 18 Z" />
        <rect x="13" y="20" width="19" height="3" />
        <path d="M11 23 h23 l-2 11 h-19 z" />
      </g>
    ),
    knight: (
      <g fill="#F4ECDD" fillRule="evenodd">
        <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
        <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,5.5 16.5,4.5 16.5,4.5 L 18,7 L 18,3.5 L 19.5,2.5 L 21,5.5 L 21,2.5 L 22.5,4 L 22.5,5.5 C 26.5,4.5 30.5,7 32.5,12 L 32.5,16 L 31,17 L 29.5,18 C 29.5,18 27.5,18.5 26.5,18.5 L 24,18 z" />
      </g>
    ),
    pawn: (
      <g fill="#F4ECDD">
        <circle cx="22.5" cy="9" r="5" />
        <path d="M18 14 h9 l-1 5 h-7 z" />
        <path d="M16 19 h13 l-2 9 h-9 z" />
        <rect x="13" y="28" width="19" height="3" />
        <path d="M11 31 h23 l-2 9 h-19 z" />
      </g>
    ),
  };

  return (
    <svg
      viewBox="0 0 45 45"
      width="70"
      height="70"
      className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.08]"
    >
      {paths[piece] || paths.pawn}
    </svg>
  );
};

export const MasterCard: React.FC<MasterCardProps> = ({
  master,
  onViewSchedule: _onViewSchedule,
}) => {
  void _onViewSchedule;
  const headerBg = getHeaderColor(master.id);
  const colorIdx = master.id % 3;
  const isGold = colorIdx === 1;
  const patternId = `master-pattern-${master.id}-${colorIdx}`;
  const piece = TITLE_TO_PIECE[master.title || ""] || "pawn";
  const hasPhoto = !!master.profilePictureThumbnailUrl;

  return (
    <Link
      to={`/users/${master.id}`}
      className="group bg-white border border-[#1F1109]/[0.12] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-[#1F1109]/25 hover:-translate-y-0.5"
    >
      {/* Card header */}
      <div
        className="h-[200px] relative flex items-center justify-center overflow-hidden"
        style={hasPhoto ? undefined : { backgroundColor: headerBg }}
      >
        {hasPhoto ? (
          <img
            className="absolute inset-0 w-full h-full object-cover"
            src={MEDIA_URL + master.profilePictureThumbnailUrl}
            alt={master.username}
          />
        ) : (
          <>
            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id={patternId} x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
                  <rect
                    x="0"
                    y="0"
                    width="18"
                    height="18"
                    fill={isGold ? "#1F1109" : "#FAF5EB"}
                    fillOpacity={isGold ? "0.06" : "0.05"}
                  />
                  <rect
                    x="18"
                    y="18"
                    width="18"
                    height="18"
                    fill={isGold ? "#1F1109" : "#FAF5EB"}
                    fillOpacity={isGold ? "0.06" : "0.05"}
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${patternId})`} />
            </svg>
            <PieceSvg piece={piece} />
          </>
        )}

        {master.title && (
          <span
            className={`absolute top-2 left-2 text-[9px] font-medium px-[7px] py-[3px] rounded tracking-[0.06em] ${
              hasPhoto
                ? "bg-[#1F1109]/85 text-[#F4ECDD]"
                : isGold
                ? "bg-[#1F1109]/85 text-[#F4ECDD]"
                : "bg-[#F4ECDD]/95 text-[#3D2817]"
            }`}
          >
            {master.title}
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="px-3 py-[11px] pb-3">
        <div className="text-xs font-medium text-[#1F1109] mb-0.5 truncate">
          {master.username}
        </div>

        <div className="text-[10px] text-[#6B5640] mb-1.5">
          {master.rating && <>{master.rating}</>}
          {master.languages && master.languages.length > 0 && (
            <>
              {master.rating && " · "}
              {master.languages.slice(0, 3).join(" · ")}
            </>
          )}
        </div>

        {master.bio && (
          <div className="text-[9px] text-[#6B4F1F] mb-2 truncate">
            {master.bio}
          </div>
        )}

        <div className="flex justify-between items-baseline pt-[7px] border-t border-[#1F1109]/[0.08]">
          {master.hourlyRate != null ? (
            <span className="text-[13px] font-medium text-[#1F1109]">
              ${master.hourlyRate.toFixed(0)}
              <span className="text-[#6B5640] font-normal">/hr</span>
            </span>
          ) : (
            <span />
          )}
          <span className="text-[10px] text-[#B8893D] font-medium">View →</span>
        </div>
      </div>
    </Link>
  );
};
