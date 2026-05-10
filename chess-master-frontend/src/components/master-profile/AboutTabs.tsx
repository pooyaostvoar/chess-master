import React, { useLayoutEffect, useRef, useState } from "react";
import { BaseUser } from "@chess-master/schemas";

interface Props {
  user: BaseUser;
}

type TabKey =
  | "about"
  | "playing"
  | "teaching"
  | "other"
  | "skills"
  | "methodology";

const TABS: { key: TabKey; label: string; eyebrow: string; heading: string }[] = [
  { key: "about", label: "About me", eyebrow: "About", heading: "Background" },
  { key: "playing", label: "Playing experience", eyebrow: "Experience", heading: "Playing experience" },
  { key: "teaching", label: "Teaching experience", eyebrow: "Experience", heading: "Teaching experience" },
  { key: "other", label: "Other experiences", eyebrow: "Beyond the board", heading: "Other experiences" },
  { key: "skills", label: "Best skills", eyebrow: "Specialty", heading: "Coaching focus" },
  { key: "methodology", label: "Teaching methodology", eyebrow: "Approach", heading: "Teaching methodology" },
];

const PLACEHOLDER: Record<Exclude<TabKey, "about" | "skills">, string> = {
  playing:
    "I've been competing in chess for over a decade, with results in national and international tournaments across classical, rapid, and blitz formats. My playing style leans positional, with an emphasis on long-term planning and endgame technique — though I'm comfortable in sharp, tactical positions when the game calls for it.",
  teaching:
    "I've worked with students from beginner to advanced level, ranging from juniors preparing for their first rated event to club players pushing past 2000. Lessons are interactive — I ask a lot of questions, dig into the reasoning behind your moves, and assign focused homework to reinforce what we cover together.",
  other:
    "I've contributed articles, opening repertoires, and training material to several chess publications and platforms. I also stream and analyze games online, and have collaborated on coaching projects with academies and clubs.",
  methodology:
    "My coaching philosophy is straightforward: every player is different, and so every plan should be too. We start by identifying real weaknesses in your games — not generic ones — and build a study plan around them. Expect honest feedback, no empty promises, and consistent follow-through between sessions.",
};

export const AboutTabs: React.FC<Props> = ({ user }) => {
  const [active, setActive] = useState<TabKey>("about");
  const [bioExpanded, setBioExpanded] = useState(false);
  const [bioOverflows, setBioOverflows] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);

  const bioText = user.bio?.trim() ?? "";
  const masterTags = user.teachingFocuses ?? [];
  const activeTab = TABS.find((t) => t.key === active)!;

  useLayoutEffect(() => {
    if (active !== "about" || !bioText || bioExpanded) return;
    const measure = () => {
      if (!bioRef.current) return;
      setBioOverflows(bioRef.current.scrollHeight > bioRef.current.clientHeight);
    };
    measure();
    requestAnimationFrame(measure);
  }, [active, bioText, bioExpanded]);

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-[#1F1109]/[0.12] -mx-1 overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="flex gap-1 min-w-max px-1">
          {TABS.map((tab) => {
            const isActive = active === tab.key;
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
                {tab.label}
                {isActive && (
                  <span className="absolute left-3 right-3 -bottom-px h-[2px] bg-[#B8893D]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content — editorial layout: eyebrow + heading + body */}
      <div className="pt-5">
        <div
          className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-1.5"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {activeTab.eyebrow}
        </div>
        <h3
          className="text-base font-medium text-[#1F1109] mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {activeTab.heading}
        </h3>

        <div className="text-[13px] leading-6 text-[#5C4631]">
          {active === "about" &&
            (bioText ? (
              <div>
                <p
                  ref={bioRef}
                  className={`whitespace-pre-wrap ${
                    !bioExpanded ? "line-clamp-6" : ""
                  }`}
                >
                  {bioText}
                </p>
                {!bioExpanded && bioOverflows && (
                  <button
                    type="button"
                    onClick={() => setBioExpanded(true)}
                    className="mt-1.5 text-xs font-medium text-[#B8893D] hover:underline"
                  >
                    See more
                  </button>
                )}
                {bioExpanded && (
                  <button
                    type="button"
                    onClick={() => setBioExpanded(false)}
                    className="mt-1.5 text-xs font-medium text-[#B8893D] hover:underline"
                  >
                    See less
                  </button>
                )}
              </div>
            ) : (
              <p className="text-[#6B5640]">No bio yet.</p>
            ))}

          {active === "skills" && (
            <div className="space-y-3">
              {masterTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {masterTags.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#1F1109]/[0.12] bg-[#F4ECDD]/60 px-3 py-1 text-xs text-[#3D2817]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#6B5640]">No coaching focus added yet.</p>
              )}
              <p>
                I tailor my teaching to each student's needs, age, and the time
                they have for chess. I believe learning from your own mistakes
                is the fastest path to improvement, so I guide you to spot
                errors on your own — that way the lessons stick.
              </p>
            </div>
          )}

          {active === "playing" && <p className="whitespace-pre-wrap">{PLACEHOLDER.playing}</p>}
          {active === "teaching" && <p className="whitespace-pre-wrap">{PLACEHOLDER.teaching}</p>}
          {active === "other" && <p className="whitespace-pre-wrap">{PLACEHOLDER.other}</p>}
          {active === "methodology" && <p className="whitespace-pre-wrap">{PLACEHOLDER.methodology}</p>}
        </div>
      </div>
    </div>
  );
};
