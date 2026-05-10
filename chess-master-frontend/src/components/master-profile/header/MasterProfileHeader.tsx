import React from "react";

import { LanguageRow } from "./LanguageRow";
import { SocialMediaRow } from "./SocilaMediaRow";
import { VerifiedBadge } from "./VerifiedBadge";
import { BaseUser } from "@chess-master/schemas";
import { MEDIA_URL } from "../../../services/config";
import { useNavigate } from "react-router-dom";

interface MasterProfileHeaderProps {
  user: BaseUser;
}

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

const PiecePaths: Record<string, React.ReactNode> = {
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

const DefaultAvatar: React.FC<{ piece: string }> = ({ piece }) => (
  <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[#1F1109] ring-4 ring-[#F4ECDD]/80 shadow-xl sm:h-36 sm:w-36 shrink-0">
    <svg
      viewBox="0 0 45 45"
      className="h-16 w-16 sm:h-20 sm:w-20"
      aria-hidden="true"
    >
      {PiecePaths[piece] || PiecePaths.pawn}
    </svg>
  </div>
);

export const MasterProfileHeader: React.FC<MasterProfileHeaderProps> = ({
  user,
}) => {
  const navigate = useNavigate();
  const profileImage =
    user.profilePictureUrl || user.profilePictureThumbnailUrl;

  const fullName = [user.name, user.lastname].filter(Boolean).join(" ").trim();
  const displayName = `${user.title ? `${user.title} ` : ""}${
    fullName || user.username
  }`;
  const subtitle = fullName ? `@${user.username}` : null;

  const priceValue = user.hourlyRate
    ? `$${Number(user.hourlyRate).toFixed(0)}`
    : null;

  const piece = TITLE_TO_PIECE[user.title || ""] || "pawn";

  return (
    <div className="rounded-xl bg-gradient-to-br from-[#1F1109] via-[#3D2817] to-[#5C3A1E] text-[#F4ECDD] border border-[#1F1109]/[0.12]">
      <div className="flex flex-col gap-6 p-5 sm:p-8 md:flex-row md:items-center md:gap-8">
        {/* AVATAR */}
        {profileImage ? (
          <img
            src={MEDIA_URL + profileImage}
            alt={displayName}
            className="h-28 w-28 rounded-3xl object-cover shadow-xl ring-4 ring-[#F4ECDD]/80 sm:h-36 sm:w-36 shrink-0"
          />
        ) : (
          <DefaultAvatar piece={piece} />
        )}

        {/* META */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <VerifiedBadge />
          </div>

          <h1
            className="text-2xl font-medium tracking-tight sm:text-4xl leading-[1.1]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            {displayName}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[#F4ECDD]/65 truncate">
              {subtitle}
            </p>
          )}

          {user.location && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-[#F4ECDD]/85">
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4 shrink-0"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 18s6-5.686 6-10A6 6 0 1 0 4 8c0 4.314 6 10 6 10Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle
                  cx="10"
                  cy="8"
                  r="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              <span>{user.location}</span>
            </div>
          )}

          {(user.languages?.length ?? 0) > 0 && (
            <div className="mt-3">
              <LanguageRow user={user} />
            </div>
          )}

          <div className="mt-4">
            <SocialMediaRow user={user} />
          </div>
        </div>

        {/* PRICE + ACTIONS */}
        <div className="flex flex-col gap-4 md:items-end md:shrink-0">
          <div className="md:text-right">
            {priceValue ? (
              <>
                <div
                  className="text-3xl sm:text-4xl font-medium leading-none text-[#F4ECDD]"
                  style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
                >
                  {priceValue}
                  <span className="text-base sm:text-lg font-normal text-[#F4ECDD]/65">
                    /hour
                  </span>
                </div>
                <div className="mt-1 text-[11px] tracking-[0.08em] uppercase text-[#F4ECDD]/55">
                  Per session
                </div>
              </>
            ) : (
              <div className="text-sm text-[#F4ECDD]/75">Price on request</div>
            )}
          </div>

          <div className="flex flex-row gap-2 w-full md:flex-col md:items-stretch md:w-44 [&>button]:flex-1 md:[&>button]:flex-none">
            <button
              className="flex items-center justify-center gap-2 rounded-full bg-[#B8893D] px-5 py-2.5 text-sm font-medium text-[#1F1109] transition hover:bg-[#A37728]"
              onClick={() => navigate(`/chat/${user.id}`)}
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4">
                <path
                  d="M4.167 5.833A1.667 1.667 0 0 1 5.833 4.167h8.334a1.667 1.667 0 0 1 1.666 1.666v5.834a1.667 1.667 0 0 1-1.666 1.666H9.18l-2.61 2.135c-.54.442-1.32.058-1.32-.638v-1.497H5.833a1.667 1.667 0 0 1-1.666-1.666V5.833Z"
                  fill="currentColor"
                />
              </svg>
              Message
            </button>

            <button
              className="flex items-center justify-center gap-2 rounded-full border border-[#F4ECDD]/30 bg-[#F4ECDD]/10 px-5 py-2.5 text-sm font-medium text-[#F4ECDD] backdrop-blur transition hover:bg-[#F4ECDD]/20 lg:hidden"
              onClick={() =>
                document.getElementById("free-time")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                <rect
                  x="3"
                  y="5"
                  width="14"
                  height="12"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M3 8h14M7 3v4M13 3v4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
