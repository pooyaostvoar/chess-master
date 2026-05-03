import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { getMyBookings } from "../services/bookings";
import type { Booking } from "../services/bookings";
import { SlotStatus, updateSlotStatus } from "../services/schedule";

const MyBookings: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      setBookings(res.bookings || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load bookings", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user?.isMaster]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-[#B8893D]/20 text-[#6B4F1F]";
      case "reserved":
      case "paid":
        return "bg-[#B8893D]/10 text-[#8B6F4E]";
      default:
        return "bg-[#1F1109]/[0.06] text-[#6B5640]";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "free":
        return "Available";
      case "reserved":
        return "Pending Approval";
      case "paid":
        return "Paid · Awaiting Approval";
      case "booked":
        return "Confirmed";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <div className="bg-[#7A2E2E]/10 border border-[#7A2E2E]/20 text-[#7A2E2E] text-[13px] px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF5EB] min-h-screen">
      {/* Header */}
      <div className="bg-[#F4ECDD] border-b border-[#1F1109]/[0.08]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div
            className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Sessions
          </div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[#1F1109] leading-[1.1] tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            My bookings
          </h1>
          <p className="text-[13px] text-[#5C4631] mt-1.5">
            View all slot requests and confirmed bookings
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        {bookings.length === 0 ? (
          <div className="bg-white border border-[#1F1109]/[0.12] rounded-xl p-12 text-center">
            <svg viewBox="0 0 45 45" className="w-12 h-12 mx-auto mb-4 opacity-25">
              <g fill="#5C4631">
                <circle cx="22.5" cy="9" r="5" />
                <path d="M18 14 h9 l-1 5 h-7 z" />
                <path d="M16 19 h13 l-2 9 h-9 z" />
                <rect x="13" y="28" width="19" height="3" />
                <path d="M11 31 h23 l-2 9 h-19 z" />
              </g>
            </svg>
            <h2
              className="text-lg text-[#1F1109] mb-2"
              style={{ fontFamily: "Georgia, serif" }}
            >
              No bookings yet
            </h2>
            <p className="text-[13px] text-[#6B5640] mb-5">
              You don't have any bookings yet.
            </p>
            <button
              onClick={() => navigate("/masters")}
              className="text-xs text-[#B8893D] font-medium hover:underline"
            >
              Browse masters →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((booking) => {
              const isCurrentUserMasterOfBooking =
                user?.id === booking.master?.id;

              const displayUser: any = isCurrentUserMasterOfBooking
                ? booking.reservedBy
                : booking.master;

              const displayName = isCurrentUserMasterOfBooking
                ? booking.reservedBy?.username
                : booking.master?.username || "Unknown User";

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-[#1F1109]/[0.12] rounded-xl p-5 hover:border-[#1F1109]/25 transition-colors"
                >
                  {/* Header row */}
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-4 pb-4 border-b border-[#1F1109]/[0.08]">
                    <div>
                      <div className="text-sm font-medium text-[#1F1109] mb-1">
                        {formatDate(booking.startTime)}
                      </div>
                      <div className="text-[11px] text-[#6B5640]">
                        {Math.round(
                          (new Date(booking.endTime).getTime() -
                            new Date(booking.startTime).getTime()) /
                            (1000 * 60 * 60)
                        )}{" "}
                        hour
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-full tracking-wide uppercase ${getStatusStyle(booking.status)}`}
                    >
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>

                  {/* User row */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() =>
                        displayUser?.id && navigate(`/users/${displayUser.id}`)
                      }
                    >
                      <div className="w-11 h-11 rounded-full bg-[#3D2817] flex items-center justify-center text-[#F4ECDD] text-lg font-medium flex-shrink-0">
                        {displayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#1F1109] flex items-center gap-2">
                          {displayName || "Unknown User"}
                          {displayUser?.title && (
                            <span className="text-[9px] font-medium bg-[#3D2817] text-[#F4ECDD] px-1.5 py-0.5 rounded tracking-[0.06em]">
                              {displayUser.title}
                            </span>
                          )}
                        </div>
                        {displayUser?.rating && (
                          <div className="text-[11px] text-[#6B5640]">
                            {displayUser.rating} Elo
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      {isCurrentUserMasterOfBooking &&
                        booking.status === "paid" && (
                          <>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await updateSlotStatus(booking.id, SlotStatus.Booked);
                                loadBookings();
                              }}
                              className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-[#B8893D] text-[#1F1109] hover:bg-[#A37728] transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await updateSlotStatus(booking.id, SlotStatus.Free);
                                loadBookings();
                              }}
                              className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-[#7A2E2E]/10 text-[#7A2E2E] hover:bg-[#7A2E2E]/20 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (displayUser?.id) navigate(`/chat/${displayUser.id}`);
                        }}
                        className="text-[11px] font-medium px-3 py-1.5 rounded-full border border-[#1F1109]/[0.15] text-[#3D2817] hover:bg-[#1F1109]/[0.04] transition-colors"
                      >
                        Message
                      </button>
                    </div>
                  </div>

                  {/* Pending note */}
                  {booking.status === "reserved" &&
                    !isCurrentUserMasterOfBooking && (
                      <div className="mt-4 px-3.5 py-2.5 bg-[#B8893D]/10 border-l-2 border-[#B8893D] rounded-r-lg text-[12px] text-[#6B4F1F]">
                        Waiting for master approval
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
