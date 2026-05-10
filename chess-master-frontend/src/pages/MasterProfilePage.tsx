import { BaseUser } from "@chess-master/schemas";
import { MasterProfileHeader } from "../components/master-profile/header/MasterProfileHeader";
import { useParams } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getPublicUserByUsername } from "../services/api/user.api";
import FreeTime from "../components/master-profile/free-time/FreeTime";

export default function MasterProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<BaseUser | null>(null);
  const [, setLoading] = useState(true);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [bioOverflows, setBioOverflows] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!username) return;

    const loadUser = async () => {
      try {
        const res = await getPublicUserByUsername(username);
        setUser(res);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [username]);

  useEffect(() => {
    setBioExpanded(false);
  }, [username]);

  const bioText = user?.bio?.trim() ?? "";

  useLayoutEffect(() => {
    if (!bioText || bioExpanded) {
      return;
    }
    const measure = () => {
      if (!bioRef.current) return;
      setBioOverflows(bioRef.current.scrollHeight > bioRef.current.clientHeight);
    };
    measure();
    requestAnimationFrame(measure);
  }, [bioText, bioExpanded, user?.bio]);

  if (!user) {
    return null;
  }

  const studentsLabel = user.studentsCount ?? 0;

  const stats = [
    { label: "Fide rating", value: user.rating },
    { label: "Rapid", value: user.lichessRatings?.rapid?.rating },
    { label: "Blitz", value: user.lichessRatings?.blitz?.rating },
    { label: "Students", value: studentsLabel ? `${studentsLabel}+` : null },
  ].filter((s) => s.value != null && s.value !== "");

  const masterTags = user.teachingFocuses ?? [];

  return (
    <div className="min-h-screen bg-[#FAF5EB] text-[#1F1109]">
      <div className="max-w-6xl mx-auto px-3 sm:px-8 py-6 sm:py-10 space-y-6">
        {/* HERO */}
        <MasterProfileHeader user={user} />

        {/* BODY */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* LEFT — ABOUT */}
          <section className="rounded-xl bg-white border border-[#1F1109]/[0.12] p-5 md:p-6 space-y-6">
            {stats.length > 0 && (
              <div
                className={`grid gap-3 ${
                  stats.length === 1
                    ? "grid-cols-1"
                    : stats.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 md:grid-cols-3"
                }`}
              >
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-[#1F1109]/[0.08] bg-[#FAF5EB]/60 px-3 py-3"
                  >
                    <div
                      className="text-xl md:text-2xl font-medium text-[#1F1109] leading-none"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {item.value}
                    </div>
                    <div className="mt-1.5 text-[11px] tracking-[0.04em] uppercase text-[#6B5640]">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <div
                className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-1.5"
                style={{ fontFamily: "Georgia, serif" }}
              >
                About
              </div>
              <h3
                className="text-base font-medium text-[#1F1109]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Background
              </h3>
              {bioText ? (
                <div className="mt-2">
                  <p
                    ref={bioRef}
                    className={`text-[13px] leading-6 text-[#5C4631] whitespace-pre-wrap ${
                      !bioExpanded ? "line-clamp-5" : ""
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
                <p className="mt-2 text-[13px] leading-6 text-[#6B5640]">
                  No bio yet.
                </p>
              )}
            </div>

            <div>
              <div
                className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-1.5"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Specialty
              </div>
              <h3
                className="text-base font-medium text-[#1F1109]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Coaching focus
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {masterTags.length > 0 ? (
                  masterTags.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#1F1109]/[0.12] bg-[#F4ECDD]/60 px-3 py-1 text-xs text-[#3D2817]"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-[13px] text-[#6B5640]">
                    No coaching focus added yet.
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* RIGHT — SCHEDULE */}
          <section
            id="free-time"
            className="rounded-xl bg-white border border-[#1F1109]/[0.12] p-5 md:p-6"
          >
            <FreeTime userId={user.id} username={user.username} />
          </section>
        </div>
      </div>
    </div>
  );
}
