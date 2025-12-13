import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
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

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, loading, setUser } = useUser();

  const firstLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "?";

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/home");
    } catch (err) {
      console.error("Logout error", err);
      setUser(null);
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
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

              {loading ? (
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-11 h-11 rounded-full bg-white text-slate-900 font-bold text-lg flex items-center justify-center hover:ring-2 hover:ring-primary transition-all overflow-hidden">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        firstLetter
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.isMaster ? "Master" : "Player"}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/edit-profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                    {user?.isMaster && (
                      <DropdownMenuItem
                        onClick={() => navigate(`/calendar/${user.id}`)}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>My Schedule</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate("/bookings")}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>My Bookings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
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

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t bg-slate-900 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <span className="text-lg font-bold">♔ Chess Master</span>
            <span className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Chess Master. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
