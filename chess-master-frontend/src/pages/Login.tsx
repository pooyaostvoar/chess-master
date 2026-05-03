import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { login } from "../services/auth";
import { useUser } from "../contexts/UserContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { API_URL } from "../services/config";
import { Eye, EyeOff } from "lucide-react";
import { safeRedirectPath } from "../utils/safeRedirectPath";

const Login: React.FC = () => {
  const location = useLocation();
  const { redirect, error } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      redirect: safeRedirectPath(params.get("redirect")),
      error: params.get("error"),
    };
  }, [location.search]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { setUser } = useUser();

  useEffect(() => {
    if (error === "lichess_email_required") {
      setMessage("Your Lichess account needs an email address before it can be used here.");
      return;
    }
    if (error === "lichess_invalid_state" || error === "lichess_session_expired") {
      setMessage("Your Lichess sign-in session expired. Please try again.");
      return;
    }
    if (error === "lichess_auth_failed") {
      setMessage("Lichess sign-in failed. Please try again.");
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await login(username, password);
      if (data.user) {
        setUser(data.user);
        navigate(redirect ?? "/home");
      } else {
        setMessage("Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error logging in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const oauthRedirectQuery = redirect
    ? `&redirect=${encodeURIComponent(redirect)}`
    : "";

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`;
  };

  const handleLichessLogin = () => {
    window.location.href = `${API_URL}/auth/lichess?mode=login${oauthRedirectQuery}`;
  };

  return (
    <main className={`min-h-screen ${isMobile ? "" : "grid grid-cols-[5fr_6fr]"}`}>
      {/* ─── Left panel ─── */}
      {!isMobile && (
        <div className="bg-[#3D2817] relative overflow-hidden text-[#F4ECDD] flex flex-col p-14">
          {/* Checkerboard */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <defs>
              <pattern id="loginchecker" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="50" height="50" fill="#FAF5EB" fillOpacity="0.04" />
                <rect x="50" y="50" width="50" height="50" fill="#FAF5EB" fillOpacity="0.04" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#loginchecker)" />
          </svg>

          {/* Animated knight */}
          <svg
            viewBox="0 0 45 45"
            className="absolute left-0 top-0 w-11 h-11 pointer-events-none opacity-[0.16] animate-[knightMove_36s_infinite_cubic-bezier(0.65,0,0.35,1)]"
          >
            <g fill="#F4ECDD" fillRule="evenodd">
              <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
              <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,5.5 16.5,4.5 16.5,4.5 L 18,7 L 18,3.5 L 19.5,2.5 L 21,5.5 L 21,2.5 L 22.5,4 L 22.5,5.5 C 26.5,4.5 30.5,7 32.5,12 L 32.5,16 L 31,17 L 29.5,18 C 29.5,18 27.5,18.5 26.5,18.5 L 24,18 z" />
            </g>
          </svg>

          <div className="relative z-10">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 text-[#F4ECDD] no-underline mb-20"
              style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: 16 }}
            >
              <span className="inline-block w-[9px] h-[9px] bg-[#B8893D] rotate-45" />
              Chess Master
            </Link>

            <div
              className="text-[11px] italic text-[#B8893D] tracking-[0.06em] uppercase mb-3.5"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Sign in
            </div>

            <h1
              className="text-4xl font-medium leading-[1.05] mb-4 tracking-[-0.015em]"
              style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
            >
              Welcome back
              <br />
              to the <span className="italic text-[#B8893D]">board</span>.
            </h1>

            <p className="text-sm text-[#F4ECDD]/70 leading-relaxed max-w-[380px]">
              Pick up where you left off — your matches, masters, and bookings are
              right where you left them.
            </p>
          </div>
        </div>
      )}

      {/* ─── Right panel ─── */}
      <div className={`bg-[#FAF5EB] flex flex-col justify-center ${isMobile ? "px-7 py-9" : "px-10 py-14"}`}>
        <div className="max-w-[360px] w-full mx-auto">
          {/* Mobile logo */}
          {isMobile && (
            <Link
              to="/home"
              className="inline-flex items-center gap-2 text-[#1F1109] no-underline mb-8"
              style={{ fontFamily: "Georgia, serif", fontWeight: 500, fontSize: 16 }}
            >
              <span className="inline-block w-[9px] h-[9px] bg-[#B8893D] rotate-45" />
              Chess Master
            </Link>
          )}

          {/* Error message */}
          {message && (
            <div className="mb-5 px-3.5 py-3 rounded-lg bg-[#7A2E2E]/10 border border-[#7A2E2E]/20 text-[13px] text-[#7A2E2E] text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* OAuth buttons */}
            <div className="flex flex-col gap-2 mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#1F1109]/[0.18] rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-[#1F1109] hover:border-[#1F1109]/[0.32] hover:bg-[#FDF9EE] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <button
                type="button"
                onClick={handleLichessLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#1F1109]/[0.18] rounded-lg px-3.5 py-2.5 text-[13px] font-medium text-[#1F1109] hover:border-[#1F1109]/[0.32] hover:bg-[#FDF9EE] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 45 45">
                  <g fill="#1F1109" fillRule="evenodd">
                    <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
                    <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,5.5 16.5,4.5 16.5,4.5 L 18,7 L 18,3.5 L 19.5,2.5 L 21,5.5 L 21,2.5 L 22.5,4 L 22.5,5.5 C 26.5,4.5 30.5,7 32.5,12 L 32.5,16 L 31,17 L 29.5,18 C 29.5,18 27.5,18.5 26.5,18.5 L 24,18 z" />
                  </g>
                </svg>
                Continue with Lichess
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#1F1109]/[0.15]" />
              <span className="text-[10px] text-[#8B6F4E] tracking-[0.04em] uppercase">or with email</span>
              <div className="flex-1 h-px bg-[#1F1109]/[0.15]" />
            </div>

            {/* Email */}
            <div className="mb-3.5">
              <label
                htmlFor="login-email"
                className="block text-[11px] font-medium text-[#3D2817] mb-1.5 tracking-[0.02em]"
              >
                Email
              </label>
              <input
                id="login-email"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-white border border-[#1F1109]/[0.18] rounded-lg px-3.5 py-[11px] text-[13px] text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366]"
              />
            </div>

            {/* Password */}
            <div className="mb-2">
              <div className="flex justify-between items-baseline mb-1.5">
                <label
                  htmlFor="login-pass"
                  className="text-[11px] font-medium text-[#3D2817] tracking-[0.02em]"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="login-pass"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white border border-[#1F1109]/[0.18] rounded-lg pl-3.5 pr-9 py-[11px] text-[13px] text-[#1F1109] outline-none transition-colors focus:border-[#B8893D] focus:bg-[#FDF9EE] placeholder:text-[#9C8366]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8B6F4E] hover:text-[#3D2817] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg px-3.5 py-3 text-[13px] font-medium text-[#1F1109] mt-[18px] transition-colors ${
                loading
                  ? "bg-[#8B6F4E] cursor-wait pointer-events-none"
                  : "bg-[#B8893D] hover:bg-[#A37728] active:scale-[0.99]"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {loading ? "Signing in" : "Sign in"}
                {loading && (
                  <span className="w-3 h-3 border-2 border-[#1F1109]/30 border-t-[#1F1109] rounded-full animate-spin" />
                )}
              </span>
            </button>
          </form>

          {/* Footer links */}
          <div className="text-center mt-6">
            <p className="text-xs text-[#6B5640]">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-[#B8893D] font-medium hover:underline bg-transparent border-none cursor-pointer"
              >
                Create one
              </button>
            </p>

            <div className="mt-4 pt-4 border-t border-[#1F1109]/[0.08]">
              <button
                onClick={() => navigate("/masters")}
                className="text-xs text-[#3D2817] font-medium bg-transparent border-none cursor-pointer hover:underline"
              >
                Browse masters first →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
