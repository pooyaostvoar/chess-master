import { BaseUser } from "@chess-master/schemas";
import { MasterProfileHeader } from "../components/master-profile/header/MasterProfileHeader";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPublicUserByUsername } from "../services/api/user.api";
import FreeTime from "../components/master-profile/free-time/FreeTime";

export default function MasterProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<BaseUser | null>(null);
  const [loading, setLoading] = useState(true);

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
                      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                        {user.bio || "No bio yet."}
                      </p>
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
