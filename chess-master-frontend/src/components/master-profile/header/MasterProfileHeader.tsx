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

export const MasterProfileHeader: React.FC<MasterProfileHeaderProps> = ({
  user,
}) => {
  const navigate = useNavigate();
  const profileImage =
    user.profilePictureUrl || user.profilePictureThumbnailUrl;

  const displayName = `${user.title ? `${user.title} ` : ""}${user.username}`;
  const priceLabel = user.hourlyRate
    ? `$${Number(user.hourlyRate).toFixed(0)} / hour`
    : "Price on request";

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-700 text-white">
      <div className="flex items-start gap-6 p-4 sm:p-8 justify-between">
        {/* LEFT SIDE — PROFILE */}
        <div className="min-w-0">
          <div className="mb-3">
            <LanguageRow user={user} />
          </div>

          <div className="mb-4">
            <SocialMediaRow user={user} />
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <VerifiedBadge />
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur">
              {priceLabel}
            </span>
          </div>

          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {displayName}
          </h1>
        </div>

        {/* RIGHT SIDE — IMAGE + BUTTONS */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={MEDIA_URL + profileImage}
            alt={displayName}
            className="h-24 w-24 rounded-3xl object-cover shadow-xl ring-4 ring-white/80 sm:h-36 sm:w-36"
          />

          <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
            <button
              className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 md:px-6 py-2 text-xs font-semibold text-slate-900 transition hover:bg-slate-100"
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
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-4 md:px-8 py-2 text-xs font-semibold backdrop-blur transition hover:bg-white/20 lg:hidden"
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
