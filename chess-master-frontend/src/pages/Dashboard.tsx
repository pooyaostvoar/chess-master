import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { Calendar, User, BookOpen, BarChart3, Crown } from "lucide-react";

interface DashCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
}

const DashCard: React.FC<DashCardProps> = ({
  icon,
  title,
  description,
  onClick,
  disabled,
  badge,
}) => (
  <button
    onClick={disabled ? undefined : onClick}
    className={`bg-white border border-[#1F1109]/[0.12] rounded-xl p-5 text-left transition-all ${
      disabled
        ? "opacity-50 cursor-not-allowed"
        : "cursor-pointer hover:border-[#1F1109]/25 hover:-translate-y-0.5 hover:shadow-md"
    } relative`}
  >
    {badge && (
      <span className="absolute top-3 right-3 text-[9px] font-medium bg-[#B8893D]/20 text-[#6B4F1F] px-2 py-0.5 rounded tracking-wide">
        {badge}
      </span>
    )}
    <div className="mb-3 text-[#B8893D]">{icon}</div>
    <div className="text-sm font-medium text-[#1F1109] mb-1">{title}</div>
    <div className="text-xs text-[#6B5640] leading-relaxed">{description}</div>
  </button>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    }
  }, [user, userLoading, navigate]);

  if (loading) {
    return (
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#FAF5EB] min-h-screen">
      {/* Header */}
      <div className="bg-[#F4ECDD] border-b border-[#1F1109]/[0.08]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
          <div
            className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Dashboard
          </div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[#1F1109] leading-[1.1] mb-2 tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            Welcome back, <span className="italic text-[#7A2E2E]">{user?.username || "Player"}</span>
          </h1>
          <p className="text-[13px] text-[#5C4631] leading-relaxed">
            {user?.isMaster
              ? "Manage your schedule and connect with students"
              : "Find your perfect chess master and book a session"}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        {/* Nav cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {user?.isMaster ? (
            <>
              <DashCard
                icon={<Calendar className="w-8 h-8" />}
                title="My Schedule"
                description="Manage your availability and upcoming sessions"
                onClick={() => navigate(`/calendar/${user.id}`)}
              />
              <DashCard
                icon={<User className="w-8 h-8" />}
                title="My Profile"
                description="Update your profile, rating, and bio"
                onClick={() => navigate("/edit-profile")}
              />
              <DashCard
                icon={<BookOpen className="w-8 h-8" />}
                title="My Bookings"
                description="View slot requests and confirmed bookings"
                onClick={() => navigate("/bookings")}
              />
              <DashCard
                icon={<BarChart3 className="w-8 h-8" />}
                title="Statistics"
                description="View your performance metrics"
                disabled
                badge="Coming soon"
              />
            </>
          ) : (
            <>
              <DashCard
                icon={<Crown className="w-8 h-8" />}
                title="Browse Masters"
                description="Discover and book sessions with chess masters"
                onClick={() => navigate("/masters")}
              />
              <DashCard
                icon={<User className="w-8 h-8" />}
                title="My Profile"
                description="View and edit your profile settings"
                onClick={() => navigate("/edit-profile")}
              />
              <DashCard
                icon={<BookOpen className="w-8 h-8" />}
                title="My Bookings"
                description="View your upcoming and past sessions"
                onClick={() => navigate("/bookings")}
              />
            </>
          )}
        </div>

        {/* Master stats */}
        {user?.isMaster && (
          <div className="bg-[#3D2817] rounded-xl p-6 sm:p-8 relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
              <defs>
                <pattern id="dashchecker" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="40" height="40" fill="#FAF5EB" fillOpacity="0.03" />
                  <rect x="40" y="40" width="40" height="40" fill="#FAF5EB" fillOpacity="0.03" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dashchecker)" />
            </svg>

            <div className="relative">
              <h2
                className="text-lg font-medium text-[#F4ECDD] mb-5"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Master overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#F4ECDD]/10 backdrop-blur-sm rounded-lg p-5 text-center">
                  <div
                    className="text-3xl font-medium text-[#F4ECDD] mb-1"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {user.rating || "Unrated"}
                  </div>
                  <div className="text-xs text-[#F4ECDD]/60">Your Rating</div>
                </div>
                <div className="bg-[#F4ECDD]/10 backdrop-blur-sm rounded-lg p-5 text-center">
                  <div
                    className="text-3xl font-medium text-[#F4ECDD] mb-1"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {user.title || "No Title"}
                  </div>
                  <div className="text-xs text-[#F4ECDD]/60">Chess Title</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
