import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3004";

const Masters: React.FC = () => {
  const [masters, setMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <div style={styles.loading}>Loading masters...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Chess Masters</h2>

      {masters.length === 0 && (
        <p style={styles.noResults}>No masters found.</p>
      )}

      <div style={styles.list}>
        {masters.map((m) => (
          <div key={m.id} style={styles.card}>
            <h3 style={styles.name}>{m.username}</h3>
            {m.title && <p style={styles.titleTag}>{m.title}</p>}
            {m.rating && <p style={styles.rating}>Rating: {m.rating}</p>}
            {m.bio && <p style={styles.bio}>{m.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Masters;

// ------------------ STYLES ------------------

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 800,
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    marginBottom: 20,
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
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 10,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  name: {
    marginBottom: 5,
  },
  titleTag: {
    background: "#4a90e2",
    color: "white",
    display: "inline-block",
    padding: "3px 8px",
    borderRadius: 6,
    fontSize: 12,
    marginBottom: 10,
  },
  rating: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  bio: {
    fontStyle: "italic",
    color: "#555",
  },
};
