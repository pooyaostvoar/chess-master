import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:3004";

const Masters: React.FC = () => {
  const [masters, setMasters] = useState<any[]>([]);
  const [filteredMasters, setFilteredMasters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState("");
  const [titleFilter, setTitleFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadMasters = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`, {
          params: { isMaster: true },
          withCredentials: true,
        });

        setMasters(response.data.users);
        setFilteredMasters(response.data.users);
      } catch (err) {
        console.error(err);
        setError("Failed to load masters");
      } finally {
        setLoading(false);
      }
    };

    loadMasters();
  }, []);

  useEffect(() => {
    let filtered = masters;

    if (searchTerm) {
      filtered = filtered.filter((m) =>
        m.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (minRating) {
      const rating = parseInt(minRating, 10);
      filtered = filtered.filter((m) => m.rating && m.rating >= rating);
    }

    if (titleFilter) {
      filtered = filtered.filter(
        (m) => m.title && m.title.toLowerCase() === titleFilter.toLowerCase()
      );
    }

    setFilteredMasters(filtered);
  }, [searchTerm, minRating, titleFilter, masters]);

  const handleScheduleClick = (userId: number) => {
    navigate(`/calender/${userId}`);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading masters...</p>
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
        <h1 style={styles.pageTitle}>Find Your Chess Master</h1>
        <p style={styles.pageSubtitle}>
          Browse and book sessions with experienced chess masters
        </p>
      </div>

      <div style={styles.filterSection}>
        <div style={styles.filterGrid}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Search by name</label>
            <input
              type="text"
              placeholder="Search masters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Minimum rating</label>
            <input
              type="number"
              placeholder="e.g., 2000"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Title</label>
            <select
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              style={styles.select}
            >
              <option value="">All titles</option>
              <option value="GM">GM</option>
              <option value="IM">IM</option>
              <option value="FM">FM</option>
              <option value="CM">CM</option>
            </select>
          </div>
        </div>

        {(searchTerm || minRating || titleFilter) && (
          <button
            style={styles.clearButton}
            onClick={() => {
              setSearchTerm("");
              setMinRating("");
              setTitleFilter("");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredMasters.length === 0 ? (
        <div style={styles.noResults}>
          <p style={styles.noResultsText}>
            No masters found matching your criteria
          </p>
          <button
            style={styles.clearButton}
            onClick={() => {
              setSearchTerm("");
              setMinRating("");
              setTitleFilter("");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div style={styles.resultsCount}>
            {filteredMasters.length} master{filteredMasters.length !== 1 && "s"}{" "}
            found
          </div>

          <div style={styles.list}>
            {filteredMasters.map((m) => (
              <div key={m.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.avatar}>
                    {m.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={styles.cardHeaderInfo}>
                    <h3 style={styles.name}>{m.username}</h3>
                    {m.title && <span style={styles.titleTag}>{m.title}</span>}
                  </div>
                </div>

                <div style={styles.cardBody}>
                  {m.rating && (
                    <div style={styles.ratingSection}>
                      <span style={styles.ratingLabel}>Rating:</span>
                      <span style={styles.ratingValue}>{m.rating}</span>
                    </div>
                  )}

                  {m.bio && <p style={styles.bio}>{m.bio}</p>}
                </div>

                <div style={styles.cardFooter}>
                  <button
                    style={styles.scheduleButton}
                    onClick={() => handleScheduleClick(m.id)}
                  >
                    View Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Masters;

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
  errorContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "60vh",
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
  pageTitle: {
    fontSize: "42px",
    fontWeight: 700,
    color: "#2c3e50",
    marginBottom: "12px",
    lineHeight: 1.2,
  },
  pageSubtitle: {
    fontSize: "18px",
    color: "#7f8c8d",
    lineHeight: 1.6,
  },
  filterSection: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    marginBottom: "32px",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "16px",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  filterLabel: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#2c3e50",
  },
  input: {
    padding: "10px 14px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "2px solid #e0e0e0",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  select: {
    padding: "10px 14px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "2px solid #e0e0e0",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    background: "white",
    cursor: "pointer",
  },
  clearButton: {
    padding: "8px 16px",
    background: "#e0e0e0",
    color: "#2c3e50",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.2s ease",
  },
  resultsCount: {
    fontSize: "16px",
    color: "#7f8c8d",
    marginBottom: "24px",
    fontWeight: 500,
  },
  noResults: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  noResultsText: {
    fontSize: "18px",
    color: "#7f8c8d",
    marginBottom: "20px",
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "24px",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e0e0e0",
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
  cardHeaderInfo: {
    flex: 1,
  },
  name: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#2c3e50",
    marginBottom: "6px",
  },
  titleTag: {
    background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
    color: "white",
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: 600,
  },
  cardBody: {
    flex: 1,
    marginBottom: "20px",
  },
  ratingSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  ratingLabel: {
    fontSize: "14px",
    color: "#7f8c8d",
  },
  ratingValue: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#2c3e50",
  },
  bio: {
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  cardFooter: {
    paddingTop: "16px",
    borderTop: "1px solid #e0e0e0",
  },
  scheduleButton: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "15px",
    transition: "all 0.3s ease",
  },
};
