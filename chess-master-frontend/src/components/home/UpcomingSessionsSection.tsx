import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import moment from "moment";
import type { Booking } from "../../services/bookings";
import type { User } from "../../services/auth";
import { getMediaUrl } from "../../services/config";
import { SlotStatus, updateSlotStatus } from "../../services/schedule";
import { navigateToUserProfile } from "../../utils/userProfileNavigation";

interface UpcomingSessionsSectionProps {
  bookings: Booking[];
  loading: boolean;
  currentUser: User;
  loadBookings?: () => Promise<Booking[]>;
}

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
    case "booked":
      return "Confirmed";
    case "reserved":
      return "Pending";
    case "paid":
      return "Paid";
    default:
      return status;
  }
};

export const UpcomingSessionsSection: React.FC<
  UpcomingSessionsSectionProps
> = ({ bookings, loading, currentUser, loadBookings }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-[#1F1109]/[0.12] rounded-xl p-8 text-center">
        <Calendar className="h-12 w-12 text-[#6B5640]/50 mx-auto mb-4" />
        <p className="text-sm text-[#6B5640] mb-4">
          No upcoming sessions scheduled
        </p>
        <button
          onClick={() => navigate("/masters")}
          className="text-sm text-[#B8893D] font-medium hover:underline"
        >
          Browse masters →
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {bookings.map((booking) => {
        const isCurrentUserMasterOfBooking =
          currentUser.id === booking.master?.id;

        const displayUser = isCurrentUserMasterOfBooking
          ? booking.reservedBy
          : booking.master;

        const displayName = isCurrentUserMasterOfBooking
          ? booking.reservedBy?.username
          : booking.master?.username || "Unknown User";

        const profileUser = displayUser
          ? {
              id: displayUser.id,
              username: displayUser.username,
              title:
                displayUser.id === booking.master?.id
                  ? booking.master?.title
                  : undefined,
              isMaster: displayUser.id === booking.master?.id,
            }
          : null;

        return (
          <div
            key={booking.id}
            className="bg-white border border-[#1F1109]/[0.12] rounded-xl overflow-hidden flex flex-col h-full hover:shadow-md hover:border-[#1F1109]/25 transition-all cursor-pointer"
            onClick={() => navigate("/bookings")}
          >
            <div className="p-4 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 text-[#B8893D]" />
                <h3
                  className="text-base font-medium text-[#1F1109]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {moment(booking.startTime).format("MMM D, YYYY")}
                </h3>
              </div>
              <p className="text-sm text-[#6B5640] mb-3">
                {moment(booking.startTime).format("h:mm A")} –{" "}
                {moment(booking.endTime).format("h:mm A")}
              </p>

              <div
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToUserProfile(navigate, profileUser);
                }}
              >
                {displayUser?.profilePictureThumbnailUrl ? (
                  <img
                    src={getMediaUrl(displayUser.profilePictureThumbnailUrl)}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#3D2817] flex items-center justify-center text-[#F4ECDD] text-sm font-medium flex-shrink-0 cursor-pointer">
                    {displayName?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}

                <span className="text-sm font-medium text-[#1F1109] cursor-pointer hover:text-[#B8893D] transition-colors">
                  {displayName}
                </span>

                {!currentUser.isMaster && booking.master?.title && (
                  <span className="ml-auto text-xs font-medium bg-[#3D2817] text-[#F4ECDD] px-1.5 py-0.5 rounded tracking-[0.06em]">
                    {booking.master.title}
                  </span>
                )}
              </div>
            </div>

            <div className="px-4 pb-4 flex flex-wrap items-center gap-2">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full tracking-wide uppercase ${getStatusStyle(booking.status)}`}
              >
                {getStatusLabel(booking.status)}
              </span>

              {isCurrentUserMasterOfBooking && booking.status === "paid" && (
                <>
                  <button
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#B8893D] text-[#1F1109] hover:bg-[#A37728] transition-colors"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await updateSlotStatus(booking.id, SlotStatus.Booked);
                      loadBookings && loadBookings();
                    }}
                  >
                    Approve
                  </button>

                  <button
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#7A2E2E]/10 text-[#7A2E2E] hover:bg-[#7A2E2E]/20 transition-colors"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await updateSlotStatus(booking.id, SlotStatus.Free);
                      loadBookings && loadBookings();
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
