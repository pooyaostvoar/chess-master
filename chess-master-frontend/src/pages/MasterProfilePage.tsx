import { BaseUser } from "@chess-master/schemas";
import { MasterProfileHeader } from "../components/master-profile/header/MasterProfileHeader";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPublicUserByUsername } from "../services/api/user.api";
import FreeTime from "../components/master-profile/free-time/FreeTime";
import { AboutTabs } from "../components/master-profile/AboutTabs";

export default function MasterProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<BaseUser | null>(null);
  const [, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[#FAF5EB] text-[#1F1109]">
      <div className="max-w-6xl mx-auto px-3 sm:px-8 py-6 sm:py-10 space-y-6">
        {/* HERO */}
        <MasterProfileHeader user={user} />

        {/* BODY */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* LEFT — ABOUT */}
          <section className="min-w-0 rounded-xl bg-white border border-[#1F1109]/[0.12] p-5 md:p-6 space-y-6">
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

            <AboutTabs user={user} />
          </section>

          {/* RIGHT — SCHEDULE */}
          <section
            id="free-time"
            className="min-w-0 rounded-xl bg-white border border-[#1F1109]/[0.12] p-5 md:p-6"
          >
            <FreeTime userId={user.id} username={user.username} />
          </section>
        </div>
      </div>
    </div>
  );
}
