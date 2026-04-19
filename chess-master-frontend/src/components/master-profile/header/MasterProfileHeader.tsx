import React from "react";

import { LanguageRow } from "./LanguageRow";
import { SocialMediaRow } from "./SocilaMediaRow";
import { VerifiedBadge } from "./VerifiedBadge";
import { BaseUser } from "@chess-master/schemas";
import { MEDIA_URL } from "../../../services/config";

interface MasterProfileHeaderProps {
  user: BaseUser;
}

export const MasterProfileHeader: React.FC<MasterProfileHeaderProps> = ({
  user,
}) => {
  const profileImage =
    user.profilePictureUrl || user.profilePictureThumbnailUrl;

  const displayName = `${user.title ? `${user.title} ` : ""}${user.username}`;
  const priceLabel = user.hourlyRate
    ? `$${Number(user.hourlyRate).toFixed(0)} / hour`
    : "Price on request";
  return (
    <div className="relative h-[220px] w-full bg-gradient-to-r from-slate-900 via-slate-800 to-amber-700 sm:h-[220px]">
      <img
        src={MEDIA_URL + profileImage}
        alt={displayName}
        className="absolute right-6 top-6 h-28 w-28 rounded-3xl object-cover shadow-xl ring-4 ring-white/80 sm:h-36 sm:w-36"
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 flex h-full flex-col p-6 sm:p-8">
        <div className="max-w-[calc(100%-8rem)] sm:max-w-[calc(100%-11rem)] text-white">
          <div className="mb-3">
            <LanguageRow user={user} />
          </div>

          <div className="mb-4">
            <SocialMediaRow user={user} />
          </div>
        </div>

        <div className="max-w-[calc(100%-8rem)] sm:max-w-[calc(100%-11rem)] text-white">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <VerifiedBadge />
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur">
              {priceLabel}
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {displayName}
          </h1>
        </div>
      </div>
    </div>
  );
};
