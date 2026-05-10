import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { BaseUser } from "@chess-master/schemas";

interface Props {
  user: BaseUser;
}

type ProfileTab = {
  key: string;
  title: string;
  content: string;
};

export const AboutTabs: React.FC<Props> = ({ user }) => {
  const [active, setActive] = useState("");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [bioOverflows, setBioOverflows] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);

  const tabs = useMemo<ProfileTab[]>(() => {
    const sections = (user.profileSections ?? [])
      .map((section, index) => ({
        key: `${section.title.trim().toLowerCase()}-${index}`,
        title: section.title.trim(),
        content: section.content.trim(),
      }))
      .filter((section) => section.title && section.content);

    if (sections.length > 0) {
      return sections;
    }

    const bioText = user.bio?.trim();
    return bioText
      ? [{ key: "bio", title: "About me", content: bioText }]
      : [];
  }, [user.bio, user.profileSections]);

  const activeTab = tabs.find((tab) => tab.key === active) ?? tabs[0];
  const isBioFallback = activeTab?.key === "bio";

  useEffect(() => {
    if (!tabs.length) return;
    if (!tabs.some((tab) => tab.key === active)) {
      setActive(tabs[0].key);
    }
  }, [active, tabs]);

  useEffect(() => {
    setBioExpanded(false);
    setBioOverflows(false);
  }, [activeTab?.key]);

  useLayoutEffect(() => {
    if (!activeTab || !activeTab.content || bioExpanded) return;
    if (!isBioFallback && activeTab.title.toLowerCase() !== "about me") return;

    const measure = () => {
      if (!bioRef.current) return;
      setBioOverflows(bioRef.current.scrollHeight > bioRef.current.clientHeight);
    };
    measure();
    requestAnimationFrame(measure);
  }, [activeTab, bioExpanded, isBioFallback]);

  if (!activeTab) {
    return (
      <div className="text-[13px] leading-6 text-[#6B5640]">
        No profile details yet.
      </div>
    );
  }

  const shouldClamp =
    isBioFallback || activeTab.title.trim().toLowerCase() === "about me";

  const body = (
    <p
      ref={shouldClamp ? bioRef : undefined}
      className={`whitespace-pre-wrap ${shouldClamp && !bioExpanded ? "line-clamp-6" : ""}`}
    >
      {activeTab.content}
    </p>
  );

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-[#1F1109]/[0.12] -mx-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="flex gap-1 min-w-max px-1">
          {tabs.map((tab) => {
            const isActive = activeTab.key === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActive(tab.key)}
                className={`relative px-3 py-2.5 text-[13px] whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-[#1F1109] font-medium"
                    : "text-[#6B5640] hover:text-[#3D2817]"
                }`}
                style={{ fontFamily: "Georgia, serif" }}
              >
                {tab.title}
                {isActive && (
                  <span className="absolute left-3 right-3 -bottom-px h-[2px] bg-[#B8893D]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-5">
        <div className="text-[13px] leading-6 text-[#5C4631]">
          <div>
            {body}
            {shouldClamp && !bioExpanded && bioOverflows && (
              <button
                type="button"
                onClick={() => setBioExpanded(true)}
                className="mt-1.5 text-xs font-medium text-[#B8893D] hover:underline"
              >
                See more
              </button>
            )}
            {shouldClamp && bioExpanded && (
              <button
                type="button"
                onClick={() => setBioExpanded(false)}
                className="mt-1.5 text-xs font-medium text-[#B8893D] hover:underline"
              >
                See less
              </button>
            )}
          </div>

          {activeTab.title.trim().toLowerCase() === "best skills" &&
            (user.teachingFocuses?.length ?? 0) > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {user.teachingFocuses?.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#1F1109]/[0.12] bg-[#F4ECDD]/60 px-3 py-1 text-xs text-[#3D2817]"
                  >
                    {item}
                  </span>
                ))}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};
