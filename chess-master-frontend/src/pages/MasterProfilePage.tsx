import { BaseUser } from "@chess-master/schemas";
import { MasterProfileHeader } from "../components/master-profile/header/MasterProfileHeader";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPublicUserByUsername } from "../services/api/user.api";
import FreeTime from "../components/master-profile/free-time/FreeTime";
import { AboutTabs } from "../components/master-profile/AboutTabs";
import { Trophy, Zap, Timer, GraduationCap, LucideIcon } from "lucide-react";

type Status = "loading" | "ready" | "not-found";

export default function MasterProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<BaseUser | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!username) return;

    setStatus("loading");
    const loadUser = async () => {
      try {
        const res = await getPublicUserByUsername(username);
        setUser(res);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setUser(null);
        setStatus("not-found");
      }
    };

    loadUser();
  }, [username]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#FAF5EB] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-[#1F1109]/20 border-t-[#B8893D] animate-spin" />
      </div>
    );
  }

  if (status === "not-found" || !user) {
    return <UserNotFound username={username} />;
  }

  const studentsLabel = user.studentsCount ?? 0;

  const stats: { label: string; value: string | number | null | undefined; icon: LucideIcon }[] = [
    { label: "FIDE", value: user.rating, icon: Trophy },
    { label: "Rapid", value: user.lichessRatings?.rapid?.rating, icon: Timer },
    { label: "Blitz", value: user.lichessRatings?.blitz?.rating, icon: Zap },
    {
      label: "Students",
      value: studentsLabel ? `${studentsLabel}+` : null,
      icon: GraduationCap,
    },
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
                className={`grid gap-2 md:gap-3 ${
                  stats.length === 1
                    ? "grid-cols-1"
                    : stats.length === 2
                    ? "grid-cols-2"
                    : stats.length === 3
                    ? "grid-cols-3"
                    : "grid-cols-2 md:grid-cols-4"
                }`}
              >
                {stats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-2.5 rounded-lg border border-[#1F1109]/[0.08] bg-[#FAF5EB]/60 px-2.5 py-2 md:px-3 md:py-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#B8893D]/15 text-[#B8893D]">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div
                          className="text-base md:text-2xl font-medium text-[#1F1109] leading-none"
                          style={{ fontFamily: "Georgia, serif" }}
                        >
                          {item.value}
                        </div>
                        <div className="mt-1 text-[10px] md:text-[11px] tracking-[0.04em] uppercase text-[#6B5640]">
                          {item.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

function UserNotFound({ username }: { username?: string }) {
  return (
    <div className="min-h-[70vh] bg-[#FAF5EB] text-[#1F1109] px-4 py-12 sm:py-16 flex items-center justify-center">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-[#1F1109] via-[#3D2817] to-[#5C3A1E] ring-4 ring-[#F4ECDD]/80 shadow-xl">
          <svg viewBox="0 0 45 45" className="h-16 w-16" aria-hidden="true">
            <g fill="#F4ECDD">
              <circle cx="22.5" cy="9" r="5" />
              <path d="M18 14 h9 l-1 5 h-7 z" />
              <path d="M16 19 h13 l-2 9 h-9 z" />
              <rect x="13" y="28" width="19" height="3" />
              <path d="M11 31 h23 l-2 9 h-19 z" />
            </g>
          </svg>
          <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#B8893D] ring-2 ring-[#1F1109] shadow text-[#1F1109] font-semibold">
            ?
          </span>
        </div>

        <h1
          className="mt-6 text-3xl sm:text-4xl font-medium tracking-tight leading-tight"
          style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
        >
          Master not found
        </h1>

        {username && (
          <p className="mt-3 text-sm text-[#6B5640] break-all">
            We couldn't find a profile for{" "}
            <span className="font-medium text-[#1F1109]">@{username}</span>.
          </p>
        )}

        <p className="mt-2 text-sm text-[#6B5640]">
          The link may be wrong, or this master may no longer be on Chess With
          Masters.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/masters"
            className="inline-flex items-center justify-center rounded-full bg-[#B8893D] px-6 py-2.5 text-sm font-medium text-[#1F1109] transition hover:bg-[#A37728]"
          >
            Browse masters
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-[#1F1109]/15 bg-white px-6 py-2.5 text-sm font-medium text-[#1F1109] transition hover:bg-[#1F1109]/[0.04]"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
