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
    { label: "Fide rating", value: user.rating ?? "—" },
    { label: "Rapid", value: user.lichessRatings?.rapid?.rating ?? "—" },
    { label: "Blitz", value: user.lichessRatings?.blitz?.rating ?? "—" },
    { label: "Students", value: studentsLabel ? `${studentsLabel}+` : "—" },
  ];

  const masterTags = user.teachingFocuses ?? [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto md:p-6">
        <div className="space-y-12">
          <section>
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <section
                className="overflow-hidden md:rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
                style={{
                  borderBottomLeftRadius: "1.5rem",
                  borderBottomRightRadius: "1.5rem",
                }}
              >
                <MasterProfileHeader user={user} />

                <div className="grid gap-6 p-3 md:p-8">
                  <div className="space-y-6">
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                      {stats.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-200 bg-slate-50 md:p-4 p-2"
                        >
                          <div className="md:text-2xl font-semibold text-xl">
                            {item.value}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold">About</h3>
                      {bioText ? (
                        <div className="mt-3 max-w-3xl">
                          <p
                            ref={bioRef}
                            className={`text-sm leading-6 text-slate-600 sm:text-base whitespace-pre-wrap ${
                              !bioExpanded ? "line-clamp-5" : ""
                            }`}
                          >
                            {bioText}
                          </p>
                          {!bioExpanded && bioOverflows && (
                            <button
                              type="button"
                              onClick={() => setBioExpanded(true)}
                              className="mt-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 hover:underline"
                            >
                              See more
                            </button>
                          )}
                          {bioExpanded && (
                            <button
                              type="button"
                              onClick={() => setBioExpanded(false)}
                              className="mt-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 hover:underline"
                            >
                              See less
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                          No bio yet.
                        </p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold">Coaching focus</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {masterTags.length > 0 ? (
                          masterTags.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                            >
                              {item}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">
                            No coaching focus added yet.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section
                id="free-time"
                className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 md:p-6 p-3"
              >
                <FreeTime userId={user.id} />
              </section>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
