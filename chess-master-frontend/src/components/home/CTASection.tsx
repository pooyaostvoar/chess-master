import React from "react";
import { useNavigate } from "react-router-dom";

export const CTASection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#3D2817] relative overflow-hidden">
      {/* Checkerboard pattern */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="ctachecker"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="60" height="60" fill="#FAF5EB" fillOpacity="0.025" />
            <rect x="60" y="60" width="60" height="60" fill="#FAF5EB" fillOpacity="0.025" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ctachecker)" />
      </svg>

      <div className="max-w-5xl mx-auto px-5 sm:px-10 py-16 text-center relative">
        <div
          className="text-xs italic text-[#B8893D] tracking-[0.04em] mb-3.5"
          style={{ fontFamily: "Georgia, serif" }}
        >
          It's your turn
        </div>

        <h2
          className="text-3xl sm:text-4xl font-medium text-[#F4ECDD] leading-[1.1] mb-3.5 tracking-[-0.015em]"
          style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
        >
          Make your{" "}
          <span className="italic text-[#B8893D]">move</span>
        </h2>

        <p className="text-sm text-[#F4ECDD]/[0.78] mb-7 max-w-[440px] mx-auto leading-relaxed">
          Verified masters available now. Book your first session in minutes —
          pay only when your master accepts.
        </p>

        <div className="inline-flex items-center gap-4 flex-wrap justify-center">
          <button
            onClick={() => navigate("/masters")}
            className="bg-[#B8893D] text-[#1F1109] px-7 py-3 rounded-full font-medium text-sm hover:bg-[#A67B30] transition-colors"
          >
            Find your master
          </button>
          <button
            onClick={() => {
              const el = document.querySelector("[class*='ArchiveSection']") ||
                document.getElementById("archive-section");
              if (el) {
                el.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/events");
              }
            }}
            className="text-[13px] text-[#F4ECDD]/85 border-b border-[#F4ECDD]/40 pb-0.5 hover:text-[#F4ECDD] hover:border-[#F4ECDD]/60 transition-colors"
          >
            or watch a sample session →
          </button>
        </div>
      </div>
    </section>
  );
};
