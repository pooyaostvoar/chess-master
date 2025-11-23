import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3004";

const Masters: React.FC = () => {
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`, {
          params: { isMaster: true },
          withCredentials: true,
        });

        setMasters(response.data.users);
      } catch (err) {
        console.error(err);
        setError("Failed to load masters");
      } finally {
        setLoading(false);
      }
    };

    loadMasters();
  }, []);
  const handleScheduleClick = (userId: number) => {
    // Navigate to calendar page for this master
    navigate(`/calender/${userId}`);
  };

  if (loading) return <div style={styles.loading}>Loading masters...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Chess Masters</h2>

      {masters.length === 0 && (
        <p style={styles.noResults}>No masters found.</p>
      )}

      <div style={styles.list}>
        {masters.map((m) => (
          <div key={m.id} style={styles.card}>
            <h3 style={styles.name}>{m.username}</h3>

            {m.title && <span style={styles.titleTag}>{m.title}</span>}

            {m.rating && <p style={styles.rating}>Rating: {m.rating}</p>}

            {m.bio && <p style={styles.bio}>{m.bio}</p>}

            <button
              style={styles.scheduleButton}
              onClick={() => handleScheduleClick(m.id)}
            >
              Schedule
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Masters;

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 900,
    margin: "0 auto",
    padding: 20,
  },
  pageTitle: {
    textAlign: "center",
    marginBottom: 25,
    fontSize: 28,
    color: "#333",
  },
  loading: {
    textAlign: "center",
    marginTop: 30,
  },
  error: {
    textAlign: "center",
    marginTop: 30,
    color: "red",
  },
  noResults: {
    textAlign: "center",
    color: "#777",
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
    gap: 20,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    minHeight: 180,
  },
  name: {
    marginBottom: 5,
    fontSize: 18,
    fontWeight: 600,
  },
  titleTag: {
    background: "#4a90e2",
    color: "white",
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 12,
    marginBottom: 10,
    maxWidth: "fit-content",
  },
  rating: {
    fontWeight: 500,
    marginBottom: 8,
  },
  bio: {
    fontStyle: "italic",
    color: "#555",
    marginBottom: 10,
    maxWidth: "90%",
    whiteSpace: "normal",
    wordBreak: "break-word",
  },
  scheduleButton: {
    padding: "8px 12px",
    background: "#4a90e2",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 500,
    width: "fit-content",
    alignSelf: "flex-start",
  },
};
