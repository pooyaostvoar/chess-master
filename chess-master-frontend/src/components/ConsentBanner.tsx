import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  OPEN_CONSENT_EVENT,
  applyAnalyticsConsent,
  readAnalyticsConsent,
  trackPageView,
} from "../lib/analytics";

export function ConsentBanner() {
  const location = useLocation();
  const [visible, setVisible] = useState(() => readAnalyticsConsent() == null);

  useEffect(() => {
    const open = () => setVisible(true);
    window.addEventListener(OPEN_CONSENT_EVENT, open);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open);
  }, []);

  const choose = (choice: "granted" | "denied") => {
    applyAnalyticsConsent(choice);
    setVisible(false);
    if (choice === "granted") {
      trackPageView(`${location.pathname}${location.search}`, undefined, {
        force: true,
      });
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-4">
      <div className="mx-auto max-w-3xl rounded-xl border border-[#1F1109]/15 bg-[#FAF5EB] px-4 py-4 shadow-lg sm:px-5">
        <p className="text-sm leading-relaxed text-[#3D2817]">
          We use analytics cookies to understand how the site is used. They stay
          off until you choose. See the{" "}
          <Link to="/privacy-policy" className="font-medium text-[#B8893D] hover:underline">
            privacy policy
          </Link>
          .
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="rounded-lg border border-[#1F1109]/20 px-4 py-2 text-sm font-medium text-[#1F1109] hover:bg-[#1F1109]/5"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="rounded-lg border border-[#1F1109]/20 bg-[#B8893D] px-4 py-2 text-sm font-medium text-[#1F1109] hover:bg-[#A37728]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
