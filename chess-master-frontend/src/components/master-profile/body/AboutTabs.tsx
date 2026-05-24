import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight, UserCircle } from "lucide-react";
import { BaseUser } from "@chess-master/schemas";
import { useIsMobile } from "../../../hooks/useIsMobile";

interface AboutTabsProps {
  user: BaseUser;
}

type ProfileSection = {
  key: string;
  title: string;
  content: string;
};

const SWIPE_THRESHOLD = 48;

const NAV_BUTTON_CLASS =
  "inline-flex shrink-0 items-center justify-center w-9 h-9 rounded-full border border-[#1F1109]/[0.08] bg-white/70 text-[#5C4631] shadow-sm transition-all hover:border-[#B8893D]/35 hover:bg-white hover:text-[#B8893D] disabled:opacity-30 disabled:shadow-none disabled:hover:border-[#1F1109]/[0.08] disabled:hover:bg-white/70 disabled:hover:text-[#5C4631]";

const PANEL_CLASS =
  "rounded-xl border border-[#1F1109]/[0.08] bg-gradient-to-b from-[#FAF5EB]/90 to-[#FAF5EB]/50 p-4 md:p-5 shadow-[0_1px_2px_rgba(31,17,9,0.04)]";

const CONTENT_CARD_CLASS =
  "rounded-xl border border-[#1F1109]/[0.08] bg-white/55 px-4 py-4 shadow-[0_4px_16px_-6px_rgba(31,17,9,0.12)] ring-1 ring-[#1F1109]/[0.06]";

const SERIF = { fontFamily: "Georgia, serif" } as const;

export const AboutTabs: React.FC<AboutTabsProps> = ({ user }) => {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const [contentExpanded, setContentExpanded] = useState(false);
  const [contentOverflows, setContentOverflows] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const touchStartX = useRef<number | null>(null);

  const sections = useMemo<ProfileSection[]>(() => {
    const items = (user.profileSections ?? [])
      .map((section, index) => ({
        key: `${section.title.trim().toLowerCase()}-${index}`,
        title: section.title.trim(),
        content: section.content.trim(),
      }))
      .filter((section) => section.title && section.content);

    if (items.length > 0) {
      return items;
    }

    const bioText = user.bio?.trim();
    return bioText ? [{ key: "bio", title: "About me", content: bioText }] : [];
  }, [user.bio, user.profileSections]);

  const activeSection = sections[activeIndex];
  const hasMultipleSections = sections.length > 1;

  useEffect(() => {
    if (!sections.length) return;
    if (activeIndex >= sections.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, sections.length]);

  useEffect(() => {
    setContentExpanded(false);
    setContentOverflows(false);
  }, [activeSection?.key]);

  useLayoutEffect(() => {
    if (!activeSection?.content || contentExpanded) return;

    const measure = () => {
      if (!contentRef.current) return;
      setContentOverflows(
        contentRef.current.scrollHeight > contentRef.current.clientHeight,
      );
    };
    measure();
    requestAnimationFrame(measure);
  }, [activeSection, contentExpanded]);

  const goToPrevious = useCallback(() => {
    setActiveIndex((index) => Math.max(0, index - 1));
  }, []);

  const goToNext = useCallback(() => {
    setActiveIndex((index) => Math.min(sections.length - 1, index + 1));
  }, [sections.length]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultipleSections) return;

    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta < 0) {
      goToNext();
    } else {
      goToPrevious();
    }
  };

  if (!activeSection) {
    return (
      <div className={PANEL_CLASS}>
        <div className="flex items-center justify-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#B8893D]/15 text-[#B8893D] ring-1 ring-[#B8893D]/20"
            aria-hidden
          >
            <UserCircle className="h-4 w-4" strokeWidth={2} />
          </span>
          <h3
            className="text-[15px] md:text-base font-medium text-[#1F1109]"
            style={SERIF}
          >
            About
          </h3>
        </div>
        <div className={`mt-4 ${CONTENT_CARD_CLASS} text-center`}>
          <p className="text-[13px] leading-6 text-[#6B5640]">
            No profile details yet.
          </p>
        </div>
      </div>
    );
  }

  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < sections.length - 1;

  return (
    <div className={PANEL_CLASS}>
      <div className="flex items-center justify-between gap-2 min-h-[40px]">
        {hasMultipleSections ? (
          <button
            type="button"
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            aria-label="Previous section"
            className={NAV_BUTTON_CLASS}
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.25} />
          </button>
        ) : (
          <span className="w-9 shrink-0" aria-hidden />
        )}

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1 px-1">
          <div className="flex max-w-full items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#B8893D]/15 text-[#B8893D] ring-1 ring-[#B8893D]/20"
              aria-hidden
            >
              <UserCircle className="h-4 w-4" strokeWidth={2} />
            </span>
            <h3
              className="truncate text-[15px] md:text-base font-medium text-[#1F1109]"
              style={SERIF}
            >
              {activeSection.title}
            </h3>
          </div>
          {hasMultipleSections && (
            <p className="text-[11px] font-medium tracking-wide text-[#6B5640]">
              {activeIndex + 1} of {sections.length}
            </p>
          )}
        </div>

        {hasMultipleSections ? (
          <button
            type="button"
            onClick={goToNext}
            disabled={!canGoNext}
            aria-label="Next section"
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
        <div
          key={activeSection.key}
          className={`${CONTENT_CARD_CLASS} text-[13px] leading-6 text-[#5C4631]`}
        >
          <p
            ref={contentRef}
            className={`whitespace-pre-wrap ${
              !contentExpanded ? "line-clamp-6" : ""
            }`}
          >
            {activeSection.content}
          </p>
          {!contentExpanded && contentOverflows && (
            <button
              type="button"
              onClick={() => setContentExpanded(true)}
              className="mt-2 text-xs font-medium text-[#B8893D] hover:underline"
            >
              See more
            </button>
          )}
          {contentExpanded && contentOverflows && (
            <button
              type="button"
              onClick={() => setContentExpanded(false)}
              className="mt-2 text-xs font-medium text-[#B8893D] hover:underline"
            >
              See less
            </button>
          )}
        </div>
      </div>

      {hasMultipleSections && (
        <div
          className="flex items-center justify-center gap-1.5 pt-4"
          role="tablist"
          aria-label="Section selection"
        >
          {sections.map((section, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={section.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to ${section.title}`}
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
