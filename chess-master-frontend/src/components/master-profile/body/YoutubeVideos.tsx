import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Youtube } from "lucide-react";
import { BaseUser } from "@chess-master/schemas";
import { useIsMobile } from "../../../hooks/useIsMobile";
import { getYoutubeEmbedUrl } from "../../../utils/youtube";

interface YoutubeVideosProps {
  user: BaseUser;
}

const SWIPE_THRESHOLD = 48;

const NAV_BUTTON_CLASS =
  "inline-flex shrink-0 items-center justify-center w-9 h-9 rounded-full border border-[#1F1109]/[0.08] bg-white/70 text-[#5C4631] shadow-sm transition-all hover:border-[#B8893D]/35 hover:bg-white hover:text-[#B8893D] disabled:opacity-30 disabled:shadow-none disabled:hover:border-[#1F1109]/[0.08] disabled:hover:bg-white/70 disabled:hover:text-[#5C4631]";

const PANEL_CLASS =
  "rounded-xl border border-[#1F1109]/[0.08] bg-gradient-to-b from-[#FAF5EB]/90 to-[#FAF5EB]/50 p-4 md:p-5 shadow-[0_1px_2px_rgba(31,17,9,0.04)]";

const SERIF = { fontFamily: "Georgia, serif" } as const;

export const YoutubeVideos: React.FC<YoutubeVideosProps> = ({ user }) => {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const videos = useMemo<string[]>(
    () =>
      (user.youtubeVideos ?? [])
        .map((video: string) => video.trim())
        .filter((video): video is string => Boolean(video)),
    [user.youtubeVideos],
  );

  const hasMultipleVideos = videos.length > 1;
  const activeVideo = videos[activeIndex];
  const embedUrl = activeVideo ? getYoutubeEmbedUrl(activeVideo) : null;

  useEffect(() => {
    if (!videos.length) return;
    if (activeIndex >= videos.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, videos.length]);

  const goToPrevious = useCallback(() => {
    setActiveIndex((index) => Math.max(0, index - 1));
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((index) => Math.min(videos.length - 1, index + 1));
  }, [videos.length]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultipleVideos) return;

    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) {
      goToNext();
    } else {
      goToPrevious();
    }
  };

  if (!activeVideo) {
    return null;
  }

  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < videos.length - 1;

  return (
    <div className={PANEL_CLASS}>
      <div className="flex items-center justify-between gap-2 min-h-[40px]">
        {hasMultipleVideos ? (
          <button
            type="button"
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            aria-label="Previous video"
            className={NAV_BUTTON_CLASS}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.25} />
          </button>
        ) : (
          <span className="w-9 shrink-0" aria-hidden />
        )}

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#B8893D]/15 text-[#B8893D] ring-1 ring-[#B8893D]/20"
              aria-hidden
            >
              <Youtube className="h-4 w-4" strokeWidth={2} />
            </span>
            <h3
              className="text-[15px] md:text-base font-medium text-[#1F1109]"
              style={SERIF}
            >
              Videos
            </h3>
          </div>
          {hasMultipleVideos && (
            <p className="text-xs font-medium tracking-wide text-[#6B5640]">
              {activeIndex + 1} of {videos.length}
            </p>
          )}
        </div>

        {hasMultipleVideos ? (
          <button
            type="button"
            onClick={goToNext}
            disabled={!canGoNext}
            aria-label="Next video"
            className={NAV_BUTTON_CLASS}
          >
            <ChevronRight className="w-4 h-4" strokeWidth={2.25} />
          </button>
        ) : (
          <span className="w-9 shrink-0" aria-hidden />
        )}
      </div>

      <div
        className="mt-4 md:mt-5 touch-pan-y"
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        {embedUrl ? (
          <div
            key={activeIndex}
            className="overflow-hidden rounded-xl bg-[#1F1109] shadow-[0_10px_28px_-8px_rgba(31,17,9,0.28)] ring-1 ring-[#1F1109]/15"
          >
            <div className="relative aspect-video w-full">
              <iframe
                src={embedUrl}
                title={`Video ${activeIndex + 1}`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#B8893D]/40 bg-[#F4ECDD]/60 px-4 py-5 text-center">
            <p className="text-sm leading-6 text-[#5C4631]">
              This link could not be embedded.
            </p>
            <a
              href={activeVideo}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#B8893D] hover:underline"
            >
              Open on YouTube
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
            </a>
          </div>
        )}

        {embedUrl && (
          <div className="mt-2.5 flex justify-center">
            <a
              href={activeVideo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-[#6B5640] transition-colors hover:bg-[#1F1109]/[0.04] hover:text-[#B8893D]"
            >
              Watch on YouTube
              <ExternalLink className="h-3 w-3" strokeWidth={2} />
            </a>
          </div>
        )}
      </div>

      {hasMultipleVideos && (
        <div
          className="flex items-center justify-center gap-1.5 pt-4"
          role="tablist"
          aria-label="Video selection"
        >
          {videos.map((video: string, index: number) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${video}-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to video ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`rounded-full transition-all duration-200 ${
                  isActive
                    ? "h-2 w-6 bg-[#B8893D]"
                    : "h-1.5 w-1.5 bg-[#1F1109]/20 hover:bg-[#1F1109]/35"
                }`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
