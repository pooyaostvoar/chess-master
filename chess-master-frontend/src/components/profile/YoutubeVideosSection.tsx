import React, { useState } from "react";
import { getYoutubeVideoId } from "../../utils/youtube";

interface YoutubeVideosSectionProps {
  youtubeVideos: string[];
  onChange: (youtubeVideos: string[]) => void;
  compact?: boolean;
}

function isDuplicateVideo(videos: string[], url: string): boolean {
  const nextId = getYoutubeVideoId(url);
  return videos.some((existing) => {
    if (existing.trim() === url) return true;
    if (!nextId) return false;
    return getYoutubeVideoId(existing) === nextId;
  });
}

export const YoutubeVideosSection: React.FC<YoutubeVideosSectionProps> = ({
  youtubeVideos,
  onChange,
  compact = false,
}) => {
  const [input, setInput] = useState("");
  const [hint, setHint] = useState("");

  const videos = Array.isArray(youtubeVideos) ? youtubeVideos : [];

  const addVideo = (value: string) => {
    const url = value.trim();
    if (!url) return;

    if (isDuplicateVideo(videos, url)) {
      setHint("This video is already in your list.");
      return;
    }

    onChange([...videos, url]);
    setInput("");
    setHint("");
  };

  const removeVideo = (index: number) => {
    onChange(videos.filter((_, i) => i !== index));
    setHint("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addVideo(input);
    }
  };

  const inputClass = compact
    ? "w-full bg-white border border-[#1F1109]/[0.18] rounded-md px-3 py-2 text-xs text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366]"
    : "w-full bg-white border border-[#1F1109]/[0.18] rounded-lg px-3.5 py-[11px] text-sm text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366]";

  return (
    <div className={compact ? "space-y-2.5" : "space-y-3"}>
      {!compact && (
        <div>
          <h3 className="text-sm font-medium text-[#1F1109]">YouTube videos</h3>
          <p className="text-sm text-[#6B5640] mt-1">
            Add YouTube links to show on your public master profile.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {videos.map((video, index) => (
          <div key={`${video}-${index}`} className="flex items-center gap-2">
            <input
              type="text"
              value={video}
              readOnly
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => removeVideo(index)}
              className={`shrink-0 font-medium text-[#7A2E2E] hover:underline px-1 ${
                compact ? "text-xs" : "text-sm"
              }`}
            >
              Remove
            </button>
          </div>
        ))}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (hint) setHint("");
            }}
            onKeyDown={handleKeyDown}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            onClick={() => addVideo(input)}
            className={`shrink-0 rounded-full border border-[#B8893D]/40 font-medium text-[#8B6F1F] hover:bg-[#B8893D]/10 transition-colors whitespace-nowrap ${
              compact ? "px-3 py-2 text-[11px]" : "px-4 py-2.5 text-xs"
            }`}
          >
            Add
          </button>
        </div>
        {hint && (
          <p className="text-xs text-[#7A2E2E]">{hint}</p>
        )}
      </div>
    </div>
  );
};
