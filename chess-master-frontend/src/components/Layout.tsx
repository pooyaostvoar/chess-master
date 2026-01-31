import React from "react";
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
} from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useMasterOnboarding } from "../hooks/useMasterOnboarding";
import { OnboardingHint } from "./onboarding/OnboardingHint";
import AvatarHint from "./onboarding/AvatarHint";

const Layout: React.FC = () => {
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ───────── NAVBAR ───────── */}
      <nav className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/home"
              className="flex items-center gap-3 text-xl font-bold"
            >
              <span className="text-3xl">♔</span>
              <span className={user ? "" : "hidden sm:inline"}>
                Chess Master
              </span>
            </Link>
            {/* <Link
              to="/home"
              className="flex items-center gap-3 text-xl font-bold"
            >
              <img
                src="/logo.png"
                alt="ChessWithMasters logo"
                className="h-20 w-20"
              /> */}

            {/* <span className={user ? "" : "hidden sm:inline"}>
                ChessWithMasters
              </span> */}
            {/* </Link> */}

            <div className="flex items-center gap-8">
              {!isMobile && (
                <Link
                  to="/home"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Home
                </Link>
              )}

              <Link
                to="/masters"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Browse Masters
              </Link>

              {/* ───────── USER MENU ───────── */}
              {loading ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : user ? (
                <DropdownMenu onOpenChange={(open) => setDropDownIsOpen(open)}>
                  <DropdownMenuTrigger asChild>
                    <div className="relative">
                      <button
                        className={`w-11 h-11 rounded-full bg-white text-slate-900 font-bold text-lg flex items-center justify-center transition-all
                          ${
                            showEditProfileHint || showAddSlot
                              ? "ring-4 ring-primary ring-offset-2 animate-pulse"
                              : "hover:ring-2 hover:ring-primary"
                          }
                        `}
                      >
                        {user.profilePicture ? (
                          <img
                            src={user.profilePicture}
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

                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.isMaster ? "Master" : "Player"}
                        </p>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => navigate("/chat")}>
                      💬 Messages
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => navigate("/edit-profile")}
                      className={`flex items-center gap-2 transition-all ${
                        state === "MASTER_NO_INFO"
                          ? "animate-pulse bg-primary/10 text-primary font-semibold rounded"
                          : ""
                      }`}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Edit Profile
                    </DropdownMenuItem>

                    {user.isMaster && (
                      <DropdownMenuItem
                        onClick={() => navigate(`/calendar/${user.id}`)}
                        className={`flex items-center gap-2 transition-all ${
                          state === "MASTER_NO_SLOT"
                            ? "animate-pulse bg-primary/10 text-primary font-semibold rounded"
                            : ""
                        }`}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        My Schedule
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem onClick={() => navigate("/bookings")}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      My Bookings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="text-white hover:bg-white/10"
                  >
                    Log In
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/signup")}
                    className="bg-white text-slate-900 hover:bg-white/90"
                  >
                    Sign Up
                  </Button>
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

      <footer className="border-t bg-slate-900 text-white py-8">
        <div className="container mx-auto px-6 flex justify-between items-start flex-wrap gap-6">
          {/* Brand */}
          <span className="text-lg font-bold">♔ Chess Master</span>

          {/* Contact Us */}
          <div className="text-sm">
            <p className="font-semibold mb-1">Contact Us</p>
            <a
              href="https://wa.me/37256372739"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300"
            >
              <span className="flex items-center gap-2">
                {/* WhatsApp SVG */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path d="M16 2C8.28 2 2 8.05 2 15.5c0 2.73.83 5.27 2.26 7.42L2 30l7.3-2.13A14.1 14.1 0 0 0 16 29c7.72 0 14-6.05 14-13.5S23.72 2 16 2zm0 24.5c-2.3 0-4.45-.66-6.26-1.8l-.45-.27-4.33 1.26 1.3-4.1-.3-.42A11.9 11.9 0 0 1 4 15.5C4 9.43 9.38 4.5 16 4.5S28 9.43 28 15.5 22.62 26.5 16 26.5zm6.1-7.06c-.34-.17-2-.98-2.32-1.09-.32-.12-.55-.17-.78.17-.23.35-.9 1.09-1.1 1.32-.2.23-.4.26-.74.09-.34-.17-1.43-.5-2.73-1.6-1-.85-1.68-1.9-1.88-2.23-.2-.35-.02-.53.15-.7.15-.14.34-.38.52-.57.17-.2.23-.35.35-.58.11-.23.05-.44-.03-.61-.09-.17-.78-1.83-1.07-2.5-.28-.67-.57-.58-.78-.59h-.66c-.23 0-.61.09-.93.44-.32.35-1.22 1.18-1.22 2.88s1.25 3.34 1.43 3.58c.17.23 2.46 3.83 5.96 5.37.83.35 1.48.56 1.99.71.84.25 1.6.22 2.2.13.67-.1 2-.81 2.28-1.59.28-.78.28-1.45.2-1.59-.08-.13-.31-.22-.65-.39z" />
                </svg>
                : +372 5637 2739
              </span>
            </a>
            {/* Email */}
            <a
              href="mailto:team@chesswithmasters.com"
              className="text-blue-400 hover:text-blue-300"
            >
              <span className="flex items-center gap-2">
                📧 team@chesswithmasters.com
              </span>
            </a>
          </div>

          {/* Legal */}
          <div className="text-sm flex flex-col gap-2">
            <a
              href="/privacy-policy"
              className="text-muted-foreground hover:text-white underline-offset-4 hover:underline"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-of-service"
              className="text-muted-foreground hover:text-white underline-offset-4 hover:underline"
            >
              Terms Of Service
            </a>
            <span className="text-muted-foreground">
              © {new Date().getFullYear()} Chess Master. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
