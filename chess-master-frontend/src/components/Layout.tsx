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
  console.log(showAddSlot, showEditProfileHint);
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
        <div className="container mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
          <span className="text-lg font-bold">♔ Chess Master</span>
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Chess Master. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
