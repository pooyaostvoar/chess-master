import React from "react";

interface SocialMediaSectionProps {
  twitchUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  xUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  compact?: boolean;
}

const socialInputs: Array<{ name: string; label: string; placeholder: string }> = [
  { name: "twitchUrl", label: "Twitch", placeholder: "https://twitch.tv/yourname" },
  { name: "youtubeUrl", label: "YouTube", placeholder: "https://youtube.com/@yourname" },
  {
    name: "instagramUrl",
    label: "Instagram",
    placeholder: "https://instagram.com/yourname",
  },
  { name: "xUrl", label: "X (Twitter)", placeholder: "https://x.com/yourname" },
  { name: "facebookUrl", label: "Facebook", placeholder: "https://facebook.com/yourname" },
  { name: "tiktokUrl", label: "TikTok", placeholder: "https://tiktok.com/@yourname" },
];

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  twitchUrl,
  youtubeUrl,
  instagramUrl,
  xUrl,
  facebookUrl,
  tiktokUrl,
  onChange,
  compact = false,
}) => {
  const values: Record<string, string | null | undefined> = {
    twitchUrl,
    youtubeUrl,
    instagramUrl,
    xUrl,
    facebookUrl,
    tiktokUrl,
  };

  return (
    <div className={compact ? "space-y-2.5" : "space-y-3"}>
      {!compact && (
        <h3 className="text-sm font-medium text-[#1F1109]">Social media links</h3>
      )}
      <div className={`grid grid-cols-1 gap-2.5 ${compact ? "" : "sm:grid-cols-2 sm:gap-3"}`}>
        {socialInputs.map(({ name, label, placeholder }) => (
          <div key={name}>
            <label
              htmlFor={name}
              className={
                compact
                  ? "block text-xs font-medium text-[#3D2817] mb-1"
                  : "block text-sm font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]"
              }
            >
              {label}
            </label>
            <input
              id={name}
              type="url"
              name={name}
              value={values[name] ?? ""}
              onChange={onChange}
              placeholder={placeholder}
              className={`w-full rounded-md border border-[#1F1109]/[0.18] bg-white px-3 py-2 text-[#1F1109] placeholder:text-[#9C8366] focus:outline-none focus:border-[#B8893D] ${
                compact ? "text-xs" : "text-sm"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
