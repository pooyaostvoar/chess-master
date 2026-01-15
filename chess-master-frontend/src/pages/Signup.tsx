import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/auth";
import { useIsMobile } from "../hooks/useIsMobile";
import { API_URL } from "../services/config";

const Signup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const data = await signup(username, password, isMaster);
      if (data.status === "success") {
        setMessage("Account created successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } catch (err) {
      setMessage("Error creating user. Username may already exist.");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    const url = `${API_URL}/auth/google` + (isMaster ? "?role=master" : "");
    window.location.href = url;
  };
  return (
    <div style={styles.container}>
      {!isMobile && (
        <div style={styles.leftPanel}>
          <div style={styles.branding}>
            <h1 style={styles.brandTitle}>Chess Master</h1>
            <p style={styles.brandSubtitle}>
              Join our community and start your journey to mastery
            </p>
            <div style={styles.features}>
              <div style={styles.feature}>
                <span style={styles.checkmark}>✓</span>
                <span>Learn from the best</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.checkmark}>✓</span>
                <span>Track your progress</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.checkmark}>✓</span>
                <span>Improve your rating</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Start your chess journey today</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
                placeholder="Email"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="Create a password"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="Confirm your password"
              />
            </div>
            <label>
              <input
                type="checkbox"
                checked={isMaster}
                onChange={(e) => setIsMaster(e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              I am a Master (teacher)
            </label>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
          <button
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              width: "100%",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>

          {message && (
            <p
              style={{
                ...styles.message,
                color: message.includes("successfully") ? "#27ae60" : "#e74c3c",
                background: message.includes("successfully")
                  ? "#e8f8f5"
                  : "#fee",
              }}
            >
              {message}
            </p>
          )}

          <div style={styles.footer}>
            <span style={styles.footerText}>Already have an account?</span>
            <button
              style={styles.linkButton}
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    minHeight: "100vh",
  },
  leftPanel: {
    flex: 1,
    background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    color: "white",
  },
  branding: {
    maxWidth: "500px",
  },
  brandTitle: {
    fontSize: "48px",
    fontWeight: 700,
    marginBottom: "20px",
    lineHeight: 1.2,
  },
  brandSubtitle: {
    fontSize: "20px",
    lineHeight: 1.6,
    marginBottom: "40px",
    opacity: 0.9,
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    fontSize: "18px",
  },
  checkmark: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#27ae60",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "#f8f9fa",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "40px",
    borderRadius: "16px",
    background: "white",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    marginBottom: "8px",
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: "16px",
    color: "#7f8c8d",
    marginBottom: "32px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#2c3e50",
  },
  input: {
    padding: "12px 16px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "2px solid #e0e0e0",
    outline: "none",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  button: {
    marginTop: "10px",
    padding: "14px",
    background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: 600,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  footer: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    paddingTop: "24px",
    borderTop: "1px solid #e0e0e0",
  },
  footerText: {
    fontSize: "14px",
    color: "#7f8c8d",
  },
  linkButton: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#3498db",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "14px",
    textDecoration: "none",
  },
  message: {
    marginTop: "16px",
    padding: "12px",
    textAlign: "center",
    borderRadius: "8px",
    fontSize: "14px",
  },
};

export default Signup;
