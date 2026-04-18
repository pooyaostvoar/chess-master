import { BaseUser } from "@chess-master/schemas";
import { MasterProfileHeader } from "../components/master-profile/header/MasterProfileHeader";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPublicUser } from "../services/api/user.api";
import FreeTime from "../components/master-profile/free-time/FreeTime";

export default function MasterProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<BaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadUser = async () => {
      try {
        const res = await getPublicUser(Number(id));
        setUser(res);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);
  const availability = [
    { day: "Mon", date: "Apr 14", slots: ["10:00", "12:30", "16:00", "19:00"] },
    { day: "Tue", date: "Apr 15", slots: ["09:00", "11:30", "15:30"] },
    { day: "Wed", date: "Apr 16", slots: ["10:30", "14:00", "18:30"] },
    { day: "Thu", date: "Apr 17", slots: ["08:30", "13:00", "17:00", "20:00"] },
    { day: "Fri", date: "Apr 18", slots: ["09:30", "12:00", "16:30"] },
  ];
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

  const masterTags = [
    "Opening Repertoire",
    "Calculation Training",
    "Endgames",
    "Game Review",
    "Tournament Prep",
    "Beginner to Advanced",
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <section>
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
                <MasterProfileHeader user={user} />

                <div className="grid gap-6 p-6 sm:p-8">
                  <div className="space-y-6">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {stats.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="text-2xl font-semibold">
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
                        {masterTags.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
                <FreeTime />
                {/* <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">Free time</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Select a day and book an available slot.
                    </p>
                  </div>
                  <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                    Time zone: Europe / Tallinn
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  {availability.map((day) => (
                    <div
                      key={day.date}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {day.day}
                          </div>
                          <div className="text-sm text-slate-500">
                            {day.date}
                          </div>
                        </div>
                        <button className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white">
                          Show more
                        </button>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {day.slots.map((slot) => (
                          <button
                            key={slot}
                            className="rounded-xl border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:border-amber-500 hover:bg-amber-50"
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div> */}
              </section>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
