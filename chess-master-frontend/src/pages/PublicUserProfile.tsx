import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicUser } from "../services/api/user.api";
import { getFinishedEvents } from "../services/api/schedule.api";
import { LichessRatingsSection } from "../components/profile/LichessRatingsSection";
import { useUser } from "../contexts/UserContext";
import { MEDIA_URL } from "../services/config";

const HEADER_COLORS = ["#5C3A1E", "#B8893D", "#7A2E2E", "#3D5C1E", "#2E4A7A"] as const;

const TITLE_TO_PIECE: Record<string, "king" | "queen" | "knight" | "pawn"> = {
  GM: "king", WGM: "king",
  IM: "queen", WIM: "queen",
  FM: "knight", WFM: "knight",
  CM: "pawn", NM: "pawn",
};

const PieceSvg: React.FC<{ piece: string }> = ({ piece }) => {
  const paths: Record<string, React.ReactNode> = {
    king: (
      <g fill="#F4ECDD">
        <rect x="21" y="3" width="3" height="9" />
        <rect x="17" y="6" width="11" height="3" />
        <path d="M14 14 c 0 -4 4 -7 8.5 -7 s 8.5 3 8.5 7 v 8 h-17 z" />
        <rect x="13" y="22" width="19" height="3" />
        <path d="M11 25 h23 l-2 9 h-19 z" />
      </g>
    ),
    queen: (
      <g fill="#F4ECDD">
        <circle cx="9" cy="9" r="2" /><circle cx="14" cy="6" r="2" /><circle cx="22.5" cy="4" r="2" /><circle cx="31" cy="6" r="2" /><circle cx="36" cy="9" r="2" />
        <path d="M9 11 L36 11 L34 18 L11 18 Z" /><rect x="13" y="20" width="19" height="3" /><path d="M11 23 h23 l-2 11 h-19 z" />
      </g>
    ),
    knight: (
      <g fill="#F4ECDD" fillRule="evenodd">
        <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
        <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,5.5 16.5,4.5 16.5,4.5 L 18,7 L 18,3.5 L 19.5,2.5 L 21,5.5 L 21,2.5 L 22.5,4 L 22.5,5.5 C 26.5,4.5 30.5,7 32.5,12 L 32.5,16 L 31,17 L 29.5,18 C 29.5,18 27.5,18.5 26.5,18.5 L 24,18 z" />
      </g>
    ),
    pawn: (
      <g fill="#F4ECDD">
        <circle cx="22.5" cy="9" r="5" /><path d="M18 14 h9 l-1 5 h-7 z" /><path d="M16 19 h13 l-2 9 h-9 z" /><rect x="13" y="28" width="19" height="3" /><path d="M11 31 h23 l-2 9 h-19 z" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 45 45" width="60" height="60">
      {paths[piece] || paths.pawn}
    </svg>
  );
};

const PublicUserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useUser();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recordings, setRecordings] = useState<any[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const loadUser = async () => {
      try {
        const res = await getPublicUser(Number(id));
        setUser(res);
        // Load recordings for this master
        if (res.isMaster) {
          try {
            const eventsRes = await getFinishedEvents();
            const masterRecordings = eventsRes.events
              .filter((e: any) => e.master?.id === Number(id))
              .slice(0, 3);
            setRecordings(masterRecordings);
          } catch {}
        }
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [id]);

  const normalizeUrl = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

  if (loading) {
    return (
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg text-[#1F1109] mb-2" style={{ fontFamily: "Georgia, serif" }}>
            User not found
          </h2>
          <button onClick={() => navigate("/masters")} className="text-xs text-[#B8893D] font-medium hover:underline">
            Browse masters →
          </button>
        </div>
      </div>
    );
  }

  const headerBg = HEADER_COLORS[user.id % HEADER_COLORS.length];
  const piece = TITLE_TO_PIECE[user.title || ""] || "pawn";
  const hasPhoto = !!user.profilePictureUrl;
  const recordingColors = ["#5C3A1E", "#B8893D", "#7A2E2E"];

  return (
    <div className="bg-[#FAF5EB] min-h-screen">
      {/* Hero header */}
      <div className="relative overflow-hidden" style={{ backgroundColor: headerBg }}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <defs>
            <pattern id="profchk" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="40" height="40" fill="#FAF5EB" fillOpacity="0.04" />
              <rect x="40" y="40" width="40" height="40" fill="#FAF5EB" fillOpacity="0.04" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#profchk)" />
        </svg>

        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
          <div className="relative flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            {/* Avatar / piece */}
            <div
              className="w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#B8893D]/40"
              style={{ backgroundColor: `${headerBg}cc` }}
            >
              {hasPhoto ? (
                <img
                  src={(user.profilePictureUrl?.startsWith("http") ? "" : MEDIA_URL) + user.profilePictureUrl}
                  alt={user.username}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <PieceSvg piece={piece} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                {user.title && (
                  <span className="bg-[#F4ECDD]/95 text-[#3D2817] text-[10px] font-medium px-2 py-0.5 rounded tracking-[0.06em]">
                    {user.title}
                  </span>
                )}
                {user.isMaster && (
                  <span className="text-[11px] text-[#F4ECDD]/50 tracking-wide">Verified</span>
                )}
              </div>
              <h1
                className="text-2xl sm:text-[26px] font-medium text-[#F4ECDD] leading-[1.1] tracking-[-0.01em]"
                style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
              >
                {user.username}
              </h1>
              <div className="text-xs text-[#F4ECDD]/70 mt-1.5">
                {user.rating && <>{user.rating} Elo</>}
                {user.languages && user.languages.length > 0 && (
                  <>{user.rating && " · "}{user.languages.join(", ")}</>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 items-center flex-shrink-0 sm:mt-2">
              {currentUser && (
                <button
                  onClick={() => navigate(`/chat/${user.id}`)}
                  className="bg-transparent border border-[#F4ECDD]/25 rounded-full px-4 py-2 text-xs font-medium text-[#F4ECDD] hover:bg-[#F4ECDD]/10 transition-colors"
                >
                  Message
                </button>
              )}
              {user.isMaster && (
                <button
                  onClick={() => navigate(`/calendar/${user.id}`)}
                  className="bg-[#B8893D] text-[#1F1109] rounded-full px-4 py-2 text-xs font-medium hover:bg-[#A37728] transition-colors"
                >
                  View schedule
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      {user.isMaster && (
        <div className="bg-[#FDF9EE] border-b border-[#1F1109]/[0.08]">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-3.5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              {user.rating && (
                <div>
                  <div className="text-[9px] text-[#8B6F4E] tracking-[0.08em] uppercase mb-0.5">Elo Rating</div>
                  <div className="text-[13px] font-medium text-[#1F1109]">{user.rating}</div>
                </div>
              )}
              {user.title && (
                <div>
                  <div className="text-[9px] text-[#8B6F4E] tracking-[0.08em] uppercase mb-0.5">Title</div>
                  <div className="text-[13px] font-medium text-[#1F1109]">{user.title}</div>
                </div>
              )}
              {user.languages && user.languages.length > 0 && (
                <div>
                  <div className="text-[9px] text-[#8B6F4E] tracking-[0.08em] uppercase mb-0.5">Languages</div>
                  <div className="text-[13px] font-medium text-[#1F1109]">{user.languages.length}</div>
                </div>
              )}
              {user.hourlyRate != null && (
                <div>
                  <div className="text-[9px] text-[#8B6F4E] tracking-[0.08em] uppercase mb-0.5">Rate</div>
                  <div className="text-[13px] font-medium text-[#1F1109]">${user.hourlyRate}/hr</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Body grid */}
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-7">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          {/* Left column */}
          <div>
            {/* About */}
            {user.bio && (
              <section className="mb-7">
                <div
                  className="text-[11px] italic text-[#7A2E2E] tracking-[0.06em] uppercase mb-2"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  About {user.username}
                </div>
                <p className="text-[13px] text-[#3D2817] leading-[1.65] whitespace-pre-line">
                  {user.bio}
                </p>
              </section>
            )}

            {/* Languages */}
            {user.languages && user.languages.length > 0 && (
              <section className="mb-7">
                <div
                  className="text-[11px] italic text-[#7A2E2E] tracking-[0.06em] uppercase mb-2.5"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Languages
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {user.languages.map((lang: string) => (
                    <span
                      key={lang}
                      className="bg-[#B8893D]/[0.14] text-[#6B4F1F] text-[11px] px-3 py-1 rounded-full"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Lichess ratings */}
            {user.lichessRatings && (
              <section className="mb-7">
                <div
                  className="text-[11px] italic text-[#7A2E2E] tracking-[0.06em] uppercase mb-2.5"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Lichess ratings
                </div>
                <LichessRatingsSection
                  lichessRatings={user.lichessRatings}
                  lichessUrl={user.lichessUrl}
                />
              </section>
            )}

            {/* Recordings */}
            {recordings.length > 0 && (
              <section className="mb-7">
                <div className="flex justify-between items-baseline mb-3">
                  <div
                    className="text-[11px] italic text-[#7A2E2E] tracking-[0.06em] uppercase"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Recordings
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {recordings.map((rec: any, i: number) => {
                    const bg = recordingColors[i % recordingColors.length];
                    return (
                      <div
                        key={rec.id}
                        className="cursor-pointer hover:-translate-y-0.5 transition-transform"
                        onClick={() => setActiveVideo(rec.youtubeId)}
                      >
                        <div
                          className="h-[72px] rounded-lg relative flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: bg }}
                        >
                          {rec.youtubeId && (
                            <img
                              src={`https://img.youtube.com/vi/${rec.youtubeId}/hqdefault.jpg`}
                              alt={rec.title}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          )}
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center relative ${bg === "#B8893D" ? "bg-[#1F1109]" : "bg-[#B8893D]"}`}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#FAF5EB"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                        <div className="text-[11px] font-medium text-[#1F1109] mt-1.5 leading-[1.3] line-clamp-2">
                          {rec.title}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right column */}
          <div>
            {/* Pricing + Book CTA */}
            {user.isMaster && (
              <div className="bg-white border border-[#1F1109]/[0.12] rounded-xl p-5 mb-3">
                <div
                  className="text-[11px] italic text-[#7A2E2E] tracking-[0.06em] uppercase mb-1"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Hourly rate
                </div>
                {user.hourlyRate != null ? (
                  <div
                    className="text-[28px] font-medium text-[#1F1109] leading-none mb-4"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    ${user.hourlyRate}
                    <span className="text-xs font-normal text-[#6B5640]">/hour</span>
                  </div>
                ) : (
                  <div className="text-sm text-[#6B5640] mb-4 italic">Contact for pricing</div>
                )}

                <button
                  onClick={() => navigate(`/calendar/${user.id}`)}
                  className="w-full bg-[#B8893D] text-[#1F1109] rounded-lg py-3 text-[13px] font-medium hover:bg-[#A37728] transition-colors"
                >
                  View schedule & book →
                </button>
              </div>
            )}

            {/* Chess links */}
            {(user.chesscomUrl || user.lichessUrl) && (
              <div className="bg-white border border-[#1F1109]/[0.12] rounded-xl p-4">
                <div
                  className="text-[11px] italic text-[#7A2E2E] tracking-[0.06em] uppercase mb-3"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Find {user.username} on
                </div>

                {user.lichessUrl && (
                  <a
                    href={normalizeUrl(user.lichessUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-[#1F1109]/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 45 45">
                        <g fill="#1F1109" fillRule="evenodd">
                          <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
                          <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,5.5 16.5,4.5 16.5,4.5 L 18,7 L 18,3.5 L 19.5,2.5 L 21,5.5 L 21,2.5 L 22.5,4 L 22.5,5.5 C 26.5,4.5 30.5,7 32.5,12 L 32.5,16 L 31,17 L 29.5,18 C 29.5,18 27.5,18.5 26.5,18.5 L 24,18 z" />
                        </g>
                      </svg>
                      <span className="text-xs text-[#3D2817]">Lichess</span>
                    </div>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8B6F4E" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10" /></svg>
                  </a>
                )}

                {user.chesscomUrl && (
                  <a
                    href={normalizeUrl(user.chesscomUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-2.5 py-2 rounded-md hover:bg-[#1F1109]/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#769656]" />
                      <span className="text-xs text-[#3D2817]">Chess.com</span>
                    </div>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8B6F4E" strokeWidth="2"><path d="M7 17L17 7M7 7h10v10" /></svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-[#1F1109] rounded-xl p-4 w-full max-w-3xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-4 text-lg font-bold text-[#F4ECDD] hover:text-white"
              onClick={() => setActiveVideo(null)}
            >
              ✕
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-lg mt-2">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1`}
                title="Recording"
                frameBorder="0"
                allow="autoplay"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicUserProfile;
