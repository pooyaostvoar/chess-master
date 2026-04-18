import React from "react";

const STEPS = [
  {
    phase: "Opening",
    number: "01",
    title: "Find your master",
    description:
      "Search titled players by language, opening, or playing style. Watch a short intro before you book.",
    piece: (
      <svg viewBox="0 0 45 45" width="34" height="34" className="mt-1">
        <g fill="#5C4631">
          <circle cx="22.5" cy="9" r="5" />
          <path d="M18 14 h9 l-1 5 h-7 z" />
          <path d="M16 19 h13 l-2 9 h-9 z" />
          <rect x="13" y="28" width="19" height="3" />
          <path d="M11 31 h23 l-2 9 h-19 z" />
        </g>
      </svg>
    ),
  },
  {
    phase: "Middle game",
    number: "02",
    title: "Book your session",
    description:
      "Pick a time in your timezone. Your master reviews and accepts — only then is your card charged.",
    piece: (
      <svg viewBox="0 0 45 45" width="34" height="34" className="mt-1">
        <g fill="#5C4631" fillRule="evenodd">
          <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
          <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,5.5 16.5,4.5 16.5,4.5 L 18,7 L 18,3.5 L 19.5,2.5 L 21,5.5 L 21,2.5 L 22.5,4 L 22.5,5.5 C 26.5,4.5 30.5,7 32.5,12 L 32.5,16 L 31,17 L 29.5,18 C 29.5,18 27.5,18.5 26.5,18.5 L 24,18 z" />
        </g>
      </svg>
    ),
  },
  {
    phase: "Endgame",
    number: "03",
    title: "Make your move",
    description:
      "Meet on our integrated board. Drill openings, review games, or play training matches in real time.",
    piece: (
      <svg viewBox="0 0 45 45" width="34" height="34" className="mt-1">
        <g fill="#5C4631">
          <rect x="21" y="3" width="3" height="9" />
          <rect x="17" y="6" width="11" height="3" />
          <path d="M14 14 c 0 -4 4 -7 8.5 -7 s 8.5 3 8.5 7 v 8 h-17 z" />
          <rect x="13" y="22" width="19" height="3" />
          <path d="M11 25 h23 l-2 9 h-19 z" />
        </g>
      </svg>
    ),
  },
] as const;

const SESSION_FORMATS = [
  "1-on-1 coaching",
  "Game reviews",
  "Play a master",
  "Blitz sessions",
  "Beginner-friendly",
] as const;

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="bg-[#F4ECDD]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2.5"
            style={{ fontFamily: "Georgia, serif" }}
          >
            The game plan
          </div>
          <h2
            className="text-[28px] sm:text-[32px] font-medium text-[#1F1109] leading-[1.1] mb-3 tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            How it works
          </h2>
          <p className="text-[13px] text-[#5C4631] max-w-[420px] mx-auto leading-relaxed">
            Three steps from search to first move. No subscription, no
            commitment — you pay only when a master accepts your request.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-white border border-[#1F1109]/[0.12] rounded-xl px-5 py-[22px] relative"
            >
              {/* Phase label */}
              <div
                className="text-[10px] italic text-[#7A2E2E] tracking-[0.08em] uppercase mb-1"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {step.phase}
              </div>

              {/* Number + piece */}
              <div className="flex items-start justify-between mb-3.5">
                <span
                  className="text-[44px] font-medium italic text-[#B8893D] leading-none tracking-[-0.02em]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {step.number}
                </span>
                {step.piece}
              </div>

              {/* Title + description */}
              <div className="text-sm font-medium text-[#1F1109] mb-1.5">
                {step.title}
              </div>
              <p className="text-xs text-[#6B5640] leading-relaxed m-0">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Session formats footer */}
        <div className="text-center mt-9 pt-6 border-t border-[#1F1109]/10">
          <span className="text-[10px] text-[#6B5640] tracking-[0.08em] uppercase mr-3 align-middle">
            Session formats
          </span>
          {SESSION_FORMATS.map((format) => (
            <span
              key={format}
              className="inline-block px-3 py-1 bg-white/70 border border-[#1F1109]/[0.12] rounded-full text-[11px] text-[#3D2817] m-[3px_2px]"
            >
              {format}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
