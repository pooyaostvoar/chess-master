import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { getMyBookings } from "../services/bookings";
import type { Booking } from "../services/bookings";
import { updateSlotStatus } from "../services/schedule";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "free":
        return "#27ae60";
      case "reserved":
        return "#f39c12";
      case "booked":
        return "#27ae60";
      default:
        return "#777";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "free":
        return "Available";
      case "reserved":
        return "Pending Approval";
      case "booked":
        return "Confirmed";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Bookings</h1>
        <p style={styles.subtitle}>
          View all slot requests and confirmed bookings
        </p>
      </div>

      {bookings.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📅</div>
          <h2 style={styles.emptyTitle}>No bookings yet</h2>
          <p style={styles.emptyText}>You don't have any bookings yet.</p>
        </div>
      ) : (
        <div style={styles.bookingsList}>
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
              <div key={booking.id} style={styles.bookingCard}>
                {/* HEADER */}
                <div style={styles.cardHeader}>
                  <div style={styles.timeInfo}>
                    <div style={styles.date}>
                      {formatDate(booking.startTime)}
                    </div>
                    <div style={styles.duration}>
                      {new Date(booking.endTime).getHours() -
                        new Date(booking.startTime).getHours()}{" "}
                      hour
                    </div>
                  </div>
                  <div
                    style={{
                      ...styles.statusBadge,
                      background: getStatusColor(booking.status),
                    }}
                  >
                    {getStatusLabel(booking.status)}
                  </div>
                </div>

                {/* BODY */}
                <div style={styles.cardBody}>
                  <div style={styles.userRow}>
                    <div
                      style={styles.userInfo}
                      onClick={() =>
                        displayUser?.id && navigate(`/users/${displayUser.id}`)
                      }
                    >
                      <div style={styles.avatar}>
                        {displayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div style={styles.userDetails}>
                        <h3 style={styles.userName}>
                          {displayName || "Unknown User"}
                          {displayUser?.title && (
                            <span style={styles.titleTag}>
                              {" "}
                              {displayUser.title}
                            </span>
                          )}
                        </h3>
                        {displayUser?.rating && (
                          <p style={styles.rating}>
                            Rating: {displayUser.rating}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={styles.actionButtons}>
                      {isCurrentUserMasterOfBooking &&
                        booking.status === "reserved" && (
                          <>
                            <button
                              style={styles.approveButton}
                              onClick={async (e) => {
                                e.stopPropagation();
                                await updateSlotStatus(booking.id, "booked");
                                loadBookings();
                              }}
                            >
                              Approve
                            </button>
                            <button
                              style={styles.rejectButton}
                              onClick={async (e) => {
                                e.stopPropagation();
                                await updateSlotStatus(booking.id, "free");
                                loadBookings();
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      <button
                        style={styles.messageButton}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (displayUser?.id) {
                            navigate(`/chat/${displayUser.id}`);
                          }
                        }}
                      >
                        send message
                      </button>
                    </div>
                  </div>
                </div>

                {booking.status === "reserved" &&
                  !isCurrentUserMasterOfBooking && (
                    <div style={styles.pendingNote}>
                      ⏳ Waiting for master approval
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  errorContainer: {
    display: "flex",
    justifyContent: "center",
  },
  error: {
    color: "#e74c3c",
    fontSize: "18px",
    padding: "20px",
    background: "#fee",
    borderRadius: "8px",
  },
  header: {
    textAlign: "center",
    marginBottom: "48px",
  },
  title: {
    fontSize: "42px",
    fontWeight: 700,
    color: "#2c3e50",
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "18px",
    color: "#7f8c8d",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "20px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: 600,
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#7f8c8d",
  },
  bookingsList: {
    display: "grid",
    gap: "20px",
  },
  bookingCard: {
    background: "white",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e0e0e0",
  },
  timeInfo: {},
  date: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "8px",
  },
  duration: {
    fontSize: "14px",
    color: "#7f8c8d",
  },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    color: "white",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "uppercase",
  },
  cardBody: {
    marginBottom: "16px",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "pointer",
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "24px",
    fontWeight: 700,
    flexShrink: 0,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: "20px",
    fontWeight: 600,
    marginBottom: "4px",
  },
  titleTag: {
    background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
    color: "white",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 600,
    marginLeft: "8px",
  },
  rating: {
    fontSize: "14px",
    color: "#7f8c8d",
  },
  actionButtons: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },
  approveButton: {
    height: "28px",
    padding: "0 10px",
    fontSize: "12px",
    fontWeight: 600,
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#27ae60",
    color: "white",
  },
  rejectButton: {
    height: "28px",
    padding: "0 10px",
    fontSize: "12px",
    fontWeight: 600,
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#e74c3c",
    color: "white",
  },
  messageButton: {
    height: "28px",
    padding: "0 10px",
    fontSize: "12px",
    fontWeight: 600,
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    background: "#2563eb",
    color: "white",
  },
  pendingNote: {
    padding: "12px",
    background: "#fff9e6",
    borderLeft: "4px solid #f39c12",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#856404",
    fontWeight: 500,
  },
};

export default MyBookings;
