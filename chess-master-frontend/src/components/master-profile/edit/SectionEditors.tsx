import React, { useState } from "react";
import { Camera } from "lucide-react";
import { BaseUser } from "@chess-master/schemas";
import { CountrySelect } from "../../profile/CountrySelect";
import { LanguagesSection } from "../../profile/LanguagesSection";
import { ChessPlatformSection } from "../../profile/ChessPlatformSection";
import { SocialMediaSection } from "../../profile/SocialMediaSection";
import { TeachingFocusesSection } from "../../profile/TeachingFocusesSection";
import { ProfileSectionsSection } from "../../profile/ProfileSectionsSection";
import { YoutubeVideosSection } from "../../profile/YoutubeVideosSection";
import type { LichessRatings } from "../../../services/api/user.api";
import { getMediaUrl } from "../../../services/config";
import { EditorSheet, useProfileEdit } from "./ProfileEdit";
import { ProfileRatingsFields } from "./ProfileRatingsFields";

const INPUT_CLASS =
  "w-full rounded-lg border border-[#1F1109]/[0.18] bg-white px-3 py-2 text-sm text-[#1F1109] outline-none transition-colors placeholder:text-[#9C8366] focus:border-[#B8893D]";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-sm font-medium tracking-[0.02em] text-[#3D2817]">
      {children}
    </span>
  );
}

const TITLES = [
  { value: "", label: "No title" },
  { value: "WCM", label: "WCM — Woman Candidate Master" },
  { value: "CM", label: "CM — Candidate Master" },
  { value: "WFM", label: "WFM — Woman FIDE Master" },
  { value: "FM", label: "FM — FIDE Master" },
  { value: "WIM", label: "WIM — Woman International Master" },
  { value: "IM", label: "IM — International Master" },
  { value: "WGM", label: "WGM — Woman Grandmaster" },
  { value: "GM", label: "GM — Grandmaster" },
  { value: "WNM", label: "WNM — Woman National Master" },
  { value: "NM", label: "NM — National Master" },
];

function blankToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function asStringList(
  event: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
) {
  const value = event.target.value as unknown;
  return Array.isArray(value) ? (value as string[]) : [];
}

export function IdentityEditor({ user }: { user: BaseUser }) {
  const { save, error, uploadPhoto, saving } = useProfileEdit();
  const [name, setName] = useState(user.name ?? "");
  const [lastname, setLastname] = useState(user.lastname ?? "");
  const [title, setTitle] = useState(user.title ?? "");
  const [country, setCountry] = useState(user.country ?? "");
  const [hourlyRate, setHourlyRate] = useState(
    user.hourlyRate != null ? String(user.hourlyRate) : ""
  );
  const [localError, setLocalError] = useState("");
  const [photoError, setPhotoError] = useState("");
  const photo = user.profilePictureUrl || user.profilePictureThumbnailUrl;

  const onPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setPhotoError("");
    try {
      await uploadPhoto(file);
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Could not upload that photo."
      );
    }
  };

  const onSave = () => {
    const trimmedRate = hourlyRate.trim();
    const rate = trimmedRate === "" ? null : Number(trimmedRate);
    if (rate != null && (Number.isNaN(rate) || rate < 0)) {
      setLocalError("Enter a valid hourly rate.");
      return;
    }
    setLocalError("");
    void save({
      name: blankToNull(name),
      lastname: blankToNull(lastname),
      title: title || null,
      country: country || null,
      hourlyRate: rate,
    });
  };

  return (
    <EditorSheet
      title="Profile details"
      onSave={onSave}
      error={localError || photoError || error}
    >
      <div className="mb-4 flex items-center gap-4">
        {photo ? (
          <img
            src={getMediaUrl(photo)}
            alt=""
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[#B8893D]/30"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1F1109] text-xs text-[#F4ECDD]">
            Photo
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#B8893D] px-3.5 py-2 text-xs font-medium text-[#1F1109] hover:bg-[#A37728]">
          <Camera className="h-3.5 w-3.5" />
          {saving ? "Uploading..." : "Change photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={onPhoto}
            disabled={saving}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>First name</FieldLabel>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        <label className="block">
          <FieldLabel>Last name</FieldLabel>
          <input
            value={lastname}
            onChange={(event) => setLastname(event.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        <label className="block">
          <FieldLabel>Title</FieldLabel>
          <select
            value={title || ""}
            onChange={(event) => setTitle(event.target.value)}
            className={INPUT_CLASS}
          >
            {TITLES.map((option) => (
              <option key={option.value || "none"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <FieldLabel>Country</FieldLabel>
          <CountrySelect
            country={country}
            onChange={(event) => setCountry(event.target.value)}
            className={INPUT_CLASS}
          />
        </label>
        <label className="block sm:col-span-2">
          <FieldLabel>Hourly rate (USD)</FieldLabel>
          <input
            type="number"
            min={0}
            step="1"
            value={hourlyRate}
            onChange={(event) => setHourlyRate(event.target.value)}
            placeholder="Price on request"
            className={INPUT_CLASS}
          />
        </label>
      </div>
    </EditorSheet>
  );
}

export function LanguagesEditor({ user }: { user: BaseUser }) {
  const { save, error } = useProfileEdit();
  const [languages, setLanguages] = useState(user.languages ?? []);

  return (
    <EditorSheet
      title="Languages"
      error={error}
      onSave={() => {
        void save({ languages });
      }}
    >
      <LanguagesSection
        compact
        name="languages"
        languages={languages}
        onChange={(event) => setLanguages(asStringList(event))}
      />
    </EditorSheet>
  );
}

export function LinksEditor({ user }: { user: BaseUser }) {
  const { save, error } = useProfileEdit();
  const [links, setLinks] = useState({
    chesscomUrl: user.chesscomUrl ?? "",
    lichessUrl: user.lichessUrl ?? "",
    twitchUrl: user.twitchUrl ?? "",
    youtubeUrl: user.youtubeUrl ?? "",
    instagramUrl: user.instagramUrl ?? "",
    xUrl: user.xUrl ?? "",
    facebookUrl: user.facebookUrl ?? "",
    tiktokUrl: user.tiktokUrl ?? "",
  });

  const onChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setLinks((current) => ({ ...current, [name]: value }));
  };

  return (
    <EditorSheet
      title="Profile links"
      error={error}
      onSave={() => {
        void save({
          chesscomUrl: blankToNull(links.chesscomUrl),
          lichessUrl: blankToNull(links.lichessUrl),
          twitchUrl: blankToNull(links.twitchUrl),
          youtubeUrl: blankToNull(links.youtubeUrl),
          instagramUrl: blankToNull(links.instagramUrl),
          xUrl: blankToNull(links.xUrl),
          facebookUrl: blankToNull(links.facebookUrl),
          tiktokUrl: blankToNull(links.tiktokUrl),
        });
      }}
    >
      <div className="space-y-5">
        <ChessPlatformSection
          chesscomUrl={links.chesscomUrl}
          lichessUrl={links.lichessUrl}
          onChange={onChange}
        />
        <SocialMediaSection compact {...links} onChange={onChange} />
      </div>
    </EditorSheet>
  );
}

export function RatingsEditor({ user }: { user: BaseUser }) {
  const { save, error } = useProfileEdit();
  const [ratings, setRatings] = useState<LichessRatings | null>(
    user.lichessRatings ?? null
  );

  return (
    <EditorSheet
      bare
      title="Ratings"
      error={error}
      onSave={() => {
        void save({
          lichessRatings: ratings,
          rating: ratings?.classical?.rating ?? null,
        });
      }}
    >
      <ProfileRatingsFields ratings={ratings} onChange={setRatings} />
    </EditorSheet>
  );
}

export function TeachingFocusesEditor({ user }: { user: BaseUser }) {
  const { save, error } = useProfileEdit();
  const [teachingFocuses, setTeachingFocuses] = useState(
    user.teachingFocuses ?? []
  );

  return (
    <EditorSheet
      title="Teaching focuses"
      error={error}
      onSave={() => {
        void save({ teachingFocuses });
      }}
    >
      <TeachingFocusesSection
        compact
        teachingFocuses={teachingFocuses}
        onChange={(event) => setTeachingFocuses(asStringList(event))}
      />
    </EditorSheet>
  );
}

export function AboutEditor({ user }: { user: BaseUser }) {
  const { save, error } = useProfileEdit();
  const [sections, setSections] = useState(() => {
    const existing = user.profileSections ?? [];
    if (existing.length > 0) return existing;
    const bio = user.bio?.trim();
    return bio ? [{ title: "About me", content: bio }] : [];
  });

  return (
    <EditorSheet
      title="About"
      error={error}
      onSave={() => {
        const profileSections = sections
          .map((section) => ({
            title: section.title.trim(),
            content: section.content.trim(),
          }))
          .filter((section) => section.title && section.content);
        void save({
          profileSections,
          bio: profileSections[0]?.content ?? null,
        });
      }}
    >
      <ProfileSectionsSection compact sections={sections} onChange={setSections} />
    </EditorSheet>
  );
}

export function YoutubeEditor({ user }: { user: BaseUser }) {
  const { save, error } = useProfileEdit();
  const [youtubeVideos, setYoutubeVideos] = useState(user.youtubeVideos ?? []);

  return (
    <EditorSheet
      title="YouTube videos"
      error={error}
      onSave={() => {
        void save({
          youtubeVideos: youtubeVideos.map((video) => video.trim()).filter(Boolean),
        });
      }}
    >
      <YoutubeVideosSection
        compact
        youtubeVideos={youtubeVideos}
        onChange={setYoutubeVideos}
      />
    </EditorSheet>
  );
}

export function ProfileSectionModals({ user }: { user: BaseUser }) {
  const { activeId } = useProfileEdit();
  if (activeId === "identity") return <IdentityEditor user={user} />;
  if (activeId === "languages") return <LanguagesEditor user={user} />;
  if (activeId === "links") return <LinksEditor user={user} />;
  if (activeId === "ratings") return <RatingsEditor user={user} />;
  if (activeId === "teaching") return <TeachingFocusesEditor user={user} />;
  if (activeId === "about") return <AboutEditor user={user} />;
  if (activeId === "videos") return <YoutubeEditor user={user} />;
  return null;
}

