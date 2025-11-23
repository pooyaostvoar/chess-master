import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthUser } from "../services/auth";
import { useUser } from "../contexts/UserContext";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await getAuthUser();
      if (response.status === 401) {
        navigate("/login");
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>
          Welcome back, {user?.username || "Chess Player"}!
        </h1>
        <p style={styles.heroSubtitle}>
          {user?.isMaster
            ? "Manage your schedule and connect with students"
            : "Find your perfect chess master and book a session"}
        </p>
      </div>

      <div style={styles.grid}>
        {user?.isMaster ? (
          <>
            <div
              style={styles.card}
              onClick={() => navigate(`/calender/${user.id}`)}
            >
              <div style={styles.cardIcon}>📅</div>
              <h3 style={styles.cardTitle}>My Schedule</h3>
              <p style={styles.cardDescription}>
                Manage your availability and upcoming sessions
              </p>
            </div>

            <div style={styles.card} onClick={() => navigate("/edit-profile")}>
              <div style={styles.cardIcon}>👤</div>
              <h3 style={styles.cardTitle}>My Profile</h3>
              <p style={styles.cardDescription}>
                Update your profile, rating, and bio
              </p>
            </div>

            <div style={{ ...styles.card, ...styles.disabledCard }}>
              <div style={styles.cardIcon}>📊</div>
              <h3 style={styles.cardTitle}>Statistics</h3>
              <p style={styles.cardDescription}>
                View your performance metrics
              </p>
              <span style={styles.comingSoon}>Coming Soon</span>
            </div>
          </>
        ) : (
          <>
            <div style={styles.card} onClick={() => navigate("/masters")}>
              <div style={styles.cardIcon}>♟️</div>
              <h3 style={styles.cardTitle}>Browse Masters</h3>
              <p style={styles.cardDescription}>
                Discover and book sessions with chess masters
              </p>
            </div>

            <div style={styles.card} onClick={() => navigate("/edit-profile")}>
              <div style={styles.cardIcon}>👤</div>
              <h3 style={styles.cardTitle}>My Profile</h3>
              <p style={styles.cardDescription}>
                View and edit your profile settings
              </p>
            </div>

            <div style={{ ...styles.card, ...styles.disabledCard }}>
              <div style={styles.cardIcon}>📚</div>
              <h3 style={styles.cardTitle}>My Bookings</h3>
              <p style={styles.cardDescription}>
                View your upcoming and past sessions
              </p>
              <span style={styles.comingSoon}>Coming Soon</span>
            </div>
          </>
        )}
      </div>

      {user?.isMaster && (
        <div style={styles.infoSection}>
          <h2 style={styles.infoTitle}>Master Dashboard</h2>
          <div style={styles.stats}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{user.rating || "Unrated"}</div>
              <div style={styles.statLabel}>Your Rating</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{user.title || "No Title"}</div>
              <div style={styles.statLabel}>Chess Title</div>
            </div>
          </div>
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
    color: "#7f8c8d",
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
  hero: {
    textAlign: "center",
    marginBottom: "60px",
  },
  heroTitle: {
    fontSize: "42px",
    fontWeight: 700,
    color: "#2c3e50",
    marginBottom: "16px",
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: "18px",
    color: "#7f8c8d",
    lineHeight: 1.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    marginBottom: "60px",
  },
  card: {
    background: "white",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    position: "relative",
  },
  disabledCard: {
    cursor: "not-allowed",
    opacity: 0.6,
  },
  cardIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "22px",
    fontWeight: 600,
    color: "#2c3e50",
    marginBottom: "12px",
  },
  cardDescription: {
    fontSize: "15px",
    color: "#7f8c8d",
    lineHeight: 1.6,
  },
  comingSoon: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "#f39c12",
    color: "white",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 600,
  },
  infoSection: {
    background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
    padding: "40px",
    borderRadius: "16px",
    color: "white",
  },
  infoTitle: {
    fontSize: "28px",
    fontWeight: 700,
    marginBottom: "24px",
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  statCard: {
    background: "rgba(255,255,255,0.15)",
    padding: "24px",
    borderRadius: "12px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "14px",
    opacity: 0.9,
  },
};

export default Home;
