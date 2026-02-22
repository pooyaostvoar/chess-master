import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { getMyBookings } from "../services/bookings";
import type { Booking } from "../services/bookings";
import { updateSlotStatus } from "../services/schedule";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { BookingStatusBadge } from "../components/booking/BookingStatusBadge";
import { PendingApprovalCard } from "../components/booking/PendingApprovalCard";
import { ConfirmedBookingCard } from "../components/booking/ConfirmedBookingCard";
import { MessageCircle } from "lucide-react";

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

  const getDuration = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const mins = Math.round((e.getTime() - s.getTime()) / 60000);
    return mins >= 60 ? `${mins / 60} hr` : `${mins} min`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground">Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center p-8">
        <p className="text-destructive font-medium p-4 bg-destructive/10 rounded-lg">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
        <p className="text-muted-foreground">
          View all slot requests and confirmed bookings
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h2 className="text-xl font-semibold mb-2">No bookings yet</h2>
            <p className="text-muted-foreground mb-6">
              Book a session with a master to get started.
            </p>
            <Button onClick={() => navigate("/masters")}>Browse Masters</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const isCurrentUserMasterOfBooking =
              user?.id === booking.master?.id;

            const displayUser = isCurrentUserMasterOfBooking
              ? booking.reservedBy
              : booking.master;

            const displayName = isCurrentUserMasterOfBooking
              ? booking.reservedBy?.username
              : booking.master?.username || "Unknown User";

            const masterName = booking.master?.username || "Master";

            return (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header: date + status */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b bg-muted/30">
                    <div>
                      <p className="font-semibold">{formatDate(booking.startTime)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getDuration(booking.startTime, booking.endTime)}
                      </p>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </div>

                  {/* User info */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() =>
                      displayUser?.id && navigate(`/users/${displayUser.id}`)
                    }
                  >
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {displayName || "Unknown User"}
                        {booking.master?.title && !isCurrentUserMasterOfBooking && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            {booking.master.title}
                          </span>
                        )}
                      </p>
                      {booking.master?.rating != null && !isCurrentUserMasterOfBooking && (
                        <p className="text-sm text-muted-foreground">
                          Rating: {booking.master.rating}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status-specific content (for players, not masters) */}
                  {!isCurrentUserMasterOfBooking && booking.status === "paid" && (
                    <div className="px-4 pb-4">
                      <PendingApprovalCard
                        masterName={masterName}
                        startTime={booking.startTime}
                        endTime={booking.endTime}
                        onViewMessages={() =>
                          displayUser?.id &&
                          navigate(`/chat/${displayUser.id}`)
                        }
                        onBrowseMasters={() => navigate("/masters")}
                      />
                    </div>
                  )}

                  {!isCurrentUserMasterOfBooking && booking.status === "booked" && (
                    <div className="px-4 pb-4">
                      <ConfirmedBookingCard
                        masterName={masterName}
                        startTime={booking.startTime}
                        endTime={booking.endTime}
                        onOpenChat={() =>
                          displayUser?.id &&
                          navigate(`/chat/${displayUser.id}`)
                        }
                      />
                    </div>
                  )}

                  {/* Legacy reserved state (no payment) */}
                  {!isCurrentUserMasterOfBooking &&
                    booking.status === "reserved" && (
                      <div className="px-4 pb-4">
                        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                          <p className="text-sm text-muted-foreground">
                            Waiting for master approval. You&apos;ll be notified
                            when your request is reviewed.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3"
                            onClick={() =>
                              displayUser?.id &&
                              navigate(`/chat/${displayUser.id}`)
                            }
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            View messages
                          </Button>
                        </div>
                      </div>
                    )}

                  {/* Master actions: approve/reject when status is paid */}
                  {isCurrentUserMasterOfBooking && booking.status === "paid" && (
                    <div className="flex flex-wrap gap-2 p-4 border-t bg-muted/20">
                      <Button
                        size="sm"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await updateSlotStatus(booking.id, "booked");
                          loadBookings();
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              `Reject the request from ${displayName}? The slot will become available again.`
                            )
                          ) {
                            await updateSlotStatus(booking.id, "free");
                            loadBookings();
                          }
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {/* Message button for all */}
                  <div className="p-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (displayUser?.id) {
                          navigate(`/chat/${displayUser.id}`);
                        }
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Send message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
