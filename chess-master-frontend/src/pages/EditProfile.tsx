import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, updateUser } from "../services/auth";

const EditProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await getMe();
      if (!response.user) {
        navigate("/login");
      } else {
        setUser(response.user);
      }
    };

    checkAuth();
  }, [navigate]);

  if (!user) return <div>Loading...</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await updateUser(user.id, {
        email: user.email,
        username: user.username,
        title: user.title,
        rating: user.rating,
        bio: user.bio,
        isMaster: user.isMaster,
      });

      if (data.status === "success") {
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error updating profile");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Edit Profile</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email:</label>
          <input
            type="email"
            name="email"
            value={user.email || ""}
            onChange={handleChange}
            style={styles.input}
          />

          <label style={styles.label}>Username:</label>
          <input
            type="text"
            name="username"
            value={user.username || ""}
            onChange={handleChange}
            style={styles.input}
          />

          <label style={styles.label}>Title:</label>
          <input
            type="text"
            name="title"
            value={user.title || ""}
            onChange={handleChange}
            style={styles.input}
          />

          <label style={styles.label}>Rating:</label>
          <input
            type="number"
            name="rating"
            value={user.rating || ""}
            onChange={handleChange}
            style={styles.input}
          />

          <label style={styles.label}>Bio:</label>
          <input
            type="text"
            name="bio"
            value={user.bio || ""}
            onChange={handleChange}
            style={styles.input}
          />

          {/* NEW: IsMaster toggle */}
          <label style={styles.label}>Are you a master?</label>
          <div style={styles.checkboxRow}>
            <input
              type="checkbox"
              name="isMaster"
              checked={!!user.isMaster}
              onChange={(e) =>
                setUser((prev: any) => ({
                  ...prev,
                  isMaster: e.target.checked,
                }))
              }
              style={styles.checkbox}
            />
            <span>Yes</span>
          </div>

          <button type="submit" style={styles.button}>
            Save Changes
          </button>
        </form>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80vh",
    background: "#f0f2f5",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 450,
    background: "#fff",
    borderRadius: 12,
    padding: "30px 25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: 25,
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  label: {
    fontWeight: 500,
    color: "#555",
    marginBottom: 5,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
    outline: "none",
    transition: "all 0.2s ease",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    cursor: "pointer",
  },
  button: {
    padding: "12px 0",
    background: "#4a90e2",
    color: "#fff",
    fontWeight: 600,
    fontSize: 16,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    marginTop: 10,
    transition: "all 0.2s ease",
  },
  message: {
    textAlign: "center",
    marginTop: 15,
    color: "#4a90e2",
    fontWeight: 500,
  },
};

export default EditProfile;
