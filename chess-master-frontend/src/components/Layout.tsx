import React, { useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { useUser } from "../contexts/UserContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  LogOut,
  User,
  Calendar,
  BookOpen,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useMasterOnboarding } from "../hooks/useMasterOnboarding";
import { OnboardingHint } from "./onboarding/OnboardingHint";
import AvatarHint from "./onboarding/AvatarHint";
import { getUnreadSenders } from "../services/api/messages.api";
import { getMediaUrl } from "../services/config";

const Layout: React.FC = () => {
  const [unreadCount, setUnreadCount] = React.useState(0);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [dropDownIsOpen, setDropDownIsOpen] = React.useState(false);
  const { user, loading, setUser } = useUser();

  const {
    state,
    becomeMaster,
    setNotMaster,
    loading: onboardingLoading,
  } = useMasterOnboarding();

  const firstLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "?";

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      navigate("/home");
    }
  };
  const location = useLocation();

  const showEditProfileHint =
    onboardingLoading === false &&
    state === "MASTER_NO_INFO" &&
    !dropDownIsOpen &&
    location.pathname !== "/edit-profile";

  const showAddSlot =
    onboardingLoading === false &&
    state === "MASTER_NO_SLOT" &&
    !dropDownIsOpen &&
    !location.pathname.includes("/calendar/");

  useEffect(() => {
    const fetchUnread = async () => {
      if (!user) {
        setUnreadCount(0);
        return;
      }

      try {
        const senders = await getUnreadSenders(user.id);

        const totalUnread = senders.reduce(
          (sum, sender) => sum + sender.unreadCount,
          0
        );

        setUnreadCount(totalUnread);
      } catch (err) {
        console.error("Failed to fetch unread messages", err);
      }
    };

    fetchUnread();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ───────── NAVBAR ───────── */}
      <nav className="sticky top-0 z-50 w-full border-b shadow-sm bg-[#1F1109] text-[#F4ECDD]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/home"
              className="flex items-center gap-2.5 font-medium text-base"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "0.01em" }}
            >
              <span className="inline-block w-2.5 h-2.5 bg-[#B8893D] rotate-45" />
              <span className={user ? "" : "hidden sm:inline"}>
                Chess With Masters
              </span>
            </Link>

            <div className="flex items-center gap-8">
              {!isMobile && (
                <Link
                  to="/home"
                  className="text-sm font-medium text-[#F4ECDD]/80 hover:text-[#F4ECDD] transition-colors"
                >
                  Home
                </Link>
              )}

              <Link
                to="/masters"
                className="text-sm font-medium text-[#F4ECDD]/80 hover:text-[#F4ECDD] transition-colors"
              >
                Browse Masters
              </Link>

              {!user && !isMobile && (
                <a
                  href="/#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById("how-it-works");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    } else {
                      navigate("/home#how-it-works");
                    }
                  }}
                  className="text-sm font-medium text-[#F4ECDD]/80 hover:text-[#F4ECDD] transition-colors"
                >
                  How it works
                </a>
              )}

              {/* ───────── USER MENU ───────── */}
              {loading ? (
                <div className="w-8 h-8 border-2 border-[#F4ECDD] border-t-transparent rounded-full animate-spin" />
              ) : user ? (
                <DropdownMenu onOpenChange={(open) => setDropDownIsOpen(open)}>
                  <DropdownMenuTrigger asChild>
                    <div className="relative">
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                      <button
                        className={`w-11 h-11 rounded-full bg-[#F4ECDD] text-[#1F1109] font-bold text-lg flex items-center justify-center transition-all
                          ${
                            showEditProfileHint || showAddSlot
                              ? "ring-4 ring-[#B8893D] ring-offset-2 ring-offset-[#1F1109] animate-pulse"
                              : "hover:ring-2 hover:ring-[#B8893D]"
                          }
                        `}
                      >
                        {user.profilePictureThumbnailUrl ? (
                          <img
                            src={getMediaUrl(user.profilePictureThumbnailUrl)}
                            alt={user.username}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          firstLetter
                        )}
                      </button>

                      {(showEditProfileHint || showAddSlot) && (
                        <AvatarHint
                          text={
                            showEditProfileHint
                              ? "Edit profile"
                              : "Add your availability"
                          }
                        />
                      )}
                    </div>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-56 bg-[#FAF5EB] border-[#1F1109]/[0.12]">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-medium text-[#1F1109]">{user.username}</p>
                        <p className="text-[11px] text-[#B8893D]">
                          {user.isMaster ? "Master" : "Player"}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="bg-[#1F1109]/[0.08]" />

                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className="text-[#3D2817] focus:bg-[#B8893D]/10 focus:text-[#1F1109]">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-[#8B6F4E]" />
                      Dashboard
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate("/chat")}
                      className="flex items-center justify-between text-[#3D2817] focus:bg-[#B8893D]/10 focus:text-[#1F1109]"
                    >
                      <span className="flex items-center">
                        <MessageCircle className="mr-2 h-4 w-4 text-[#8B6F4E]" />
                        Messages
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-[#7A2E2E] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate("/edit-profile")}
                      className={`flex items-center gap-2 transition-all text-[#3D2817] focus:bg-[#B8893D]/10 focus:text-[#1F1109] ${
                        state === "MASTER_NO_INFO"
                          ? "animate-pulse bg-[#B8893D]/10 text-[#B8893D] font-semibold rounded"
                          : ""
                      }`}
                    >
                      <User className="mr-2 h-4 w-4 text-[#8B6F4E]" />
                      Edit Profile
                    </DropdownMenuItem>

                    {user.isMaster && (
                      <DropdownMenuItem
                        onClick={() => navigate(`/calendar/${user.id}`)}
                        className={`flex items-center gap-2 transition-all text-[#3D2817] focus:bg-[#B8893D]/10 focus:text-[#1F1109] ${
                          state === "MASTER_NO_SLOT"
                            ? "animate-pulse bg-[#B8893D]/10 text-[#B8893D] font-semibold rounded"
                            : ""
                        }`}
                      >
                        <Calendar className="mr-2 h-4 w-4 text-[#8B6F4E]" />
                        My Schedule
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => navigate("/bookings")} className="text-[#3D2817] focus:bg-[#B8893D]/10 focus:text-[#1F1109]">
                      <BookOpen className="mr-2 h-4 w-4 text-[#8B6F4E]" />
                      My Bookings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="bg-[#1F1109]/[0.08]" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-[#7A2E2E] focus:bg-[#7A2E2E]/10 focus:text-[#7A2E2E]"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-[13px] text-[#F4ECDD]/80 hover:text-[#F4ECDD] transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="bg-[#B8893D] text-[#1F1109] px-4 py-2 rounded-full text-[13px] font-medium hover:bg-[#A67B30] transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ───────── MASTER QUESTION POPUP ───────── */}
      {user && state === "UNKNOWN" && (
        <OnboardingHint
          title="Are you a titled player?"
          text="Masters can earn money by playing games with others."
          actions={[
            {
              label: onboardingLoading ? "Setting up..." : "Yes, I'm a master",
              onClick: becomeMaster,
            },
            {
              label: "No",
              variant: "outline",
              onClick: setNotMaster,
            },
          ]}
        />
      )}

      {/* ───────── MAIN CONTENT ───────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ───────── FOOTER ───────── */}

      {/* Same warm footer for all users */}
        <footer className="bg-[#1F1109] text-[#F4ECDD]">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-12 pb-6">
            {/* 3-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr_1fr] gap-8 mb-9">
              {/* Brand column */}
              <div>
                <div className="flex items-center gap-2.5 mb-3.5" style={{ fontFamily: "Georgia, serif" }}>
                  <span className="inline-block w-2.5 h-2.5 bg-[#B8893D] rotate-45" />
                  <span className="font-medium">Chess With Masters</span>
                </div>
                <p className="text-xs text-[#F4ECDD]/55 leading-relaxed mb-4">
                  Verified chess coaching from the players who've actually been there.
                </p>
                {/* Social icons */}
                <div className="flex gap-2.5">
                  {/* X / Twitter */}
                  <a className="w-7 h-7 border border-[#B8893D]/40 rounded-full flex items-center justify-center hover:border-[#B8893D] transition-colors" href="#" aria-label="Twitter">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#B8893D"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  {/* YouTube */}
                  <a className="w-7 h-7 border border-[#B8893D]/40 rounded-full flex items-center justify-center hover:border-[#B8893D] transition-colors" href="#" aria-label="YouTube">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#B8893D"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                  {/* Discord */}
                  <a className="w-7 h-7 border border-[#B8893D]/40 rounded-full flex items-center justify-center hover:border-[#B8893D] transition-colors" href="#" aria-label="Discord">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#B8893D"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                  </a>
                </div>
              </div>

              {/* Navigate column */}
              <div>
                <div className="text-[11px] font-medium text-[#F4ECDD]/50 tracking-[0.08em] uppercase mb-3.5">Navigate</div>
                <div className="flex flex-col gap-2">
                  <a onClick={() => navigate("/masters")} className="text-xs text-[#F4ECDD]/85 hover:text-[#F4ECDD] cursor-pointer transition-colors">Browse masters</a>
                  <a onClick={() => { const el = document.getElementById("how-it-works"); if (el) el.scrollIntoView({ behavior: "smooth" }); else navigate("/home#how-it-works"); }} className="text-xs text-[#F4ECDD]/85 hover:text-[#F4ECDD] cursor-pointer transition-colors">How it works</a>
                  <a onClick={() => navigate("/events")} className="text-xs text-[#F4ECDD]/85 hover:text-[#F4ECDD] cursor-pointer transition-colors">From the archive</a>
                </div>
              </div>

              {/* Connect column */}
              <div>
                <div className="text-[11px] font-medium text-[#F4ECDD]/50 tracking-[0.08em] uppercase mb-3.5">Connect</div>
                <div className="flex flex-col gap-2">
                  <a onClick={() => navigate("/signup")} className="text-xs text-[#F4ECDD]/85 hover:text-[#F4ECDD] cursor-pointer transition-colors">Become a master</a>
                  <a href="mailto:team@chesswithmasters.com" className="text-xs text-[#F4ECDD]/85 hover:text-[#F4ECDD] transition-colors">team@chesswithmasters.com</a>
                  <a
                    href="https://wa.me/37256372739"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B8893D]/15 border border-[#B8893D]/40 rounded-full text-[11px] text-[#B8893D] font-medium w-fit hover:bg-[#B8893D]/25 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#B8893D"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                    +372 5637 2739
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#F4ECDD]/[0.12] pt-5 flex justify-between items-center gap-4 flex-wrap">
              <span className="text-[11px] text-[#F4ECDD]/45">
                © {new Date().getFullYear()} Chess With Masters OÜ · Tallinn, Estonia
              </span>
              <div className="flex items-center gap-4 text-[11px]">
                <a href="/privacy-policy" className="text-[#F4ECDD]/60 hover:text-[#F4ECDD]/80 transition-colors">Privacy</a>
                <a href="/terms-of-service" className="text-[#F4ECDD]/60 hover:text-[#F4ECDD]/80 transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
};

export default Layout;
