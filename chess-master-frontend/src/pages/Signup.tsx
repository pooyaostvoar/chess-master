import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signup } from "../services/auth";
import { useIsMobile } from "../hooks/useIsMobile";
import { API_URL } from "../services/config";
import { GoogleAuthButton } from "../components/auth/GoogleAuthButton";

const Signup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [browseHover, setBrowseHover] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const masterParam = searchParams.get("master");

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
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error ||
        (err?.response?.data?.code === "GEOBLOCKED"
          ? "Access from your region is not permitted."
          : "Error creating user. Username may already exist.");
      setMessage(errorMsg);
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
          <div style={styles.leftOverlay} />
          <div style={styles.branding}>
            <h1 style={styles.brandTitle}>Chess Master</h1>
            <p style={styles.brandSubtitle}>
              Create an account to book sessions, chat with masters, and receive session details
            </p>
            <div style={styles.featuresCard}>
              <div style={styles.features}>
                <div style={styles.feature}>
                  <span style={styles.checkmark}>✓</span>
                  <span>Book sessions with verified masters</span>
                </div>
                <div style={styles.feature}>
                  <span style={styles.checkmark}>✓</span>
                  <span>Manage upcoming bookings and approvals</span>
                </div>
                <div style={styles.feature}>
                  <span style={styles.checkmark}>✓</span>
                  <span>Receive session links & chat with masters</span>
                </div>
                <div style={styles.feature}>
                  <span style={styles.checkmark}>✓</span>
                  <span>Faster checkout for future bookings</span>
                </div>
              </div>
              <p style={styles.flowHint}>Browse → Book → Connect</p>
            </div>
          </div>
        </div>
      )}

      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <span style={styles.secureBadge}>Secure Sign-Up</span>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>
            After signup, you can browse masters, choose a session, and request a booking in minutes.
          </p>

          <GoogleAuthButton
            label="Sign up with Google"
            onClick={handleGoogleLogin}
            disabled={loading}
          />

          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>or sign up with email</span>
            <div style={styles.dividerLine} />
          </div>

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
            {masterParam && (
              <label>
                <input
                  type="checkbox"
                  checked={isMaster}
                  onChange={(e) => setIsMaster(e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                I am a Master (teacher)
              </label>
            )}

            <button
              type="submit"
              style={{
                ...styles.button,
                ...styles.buttonPrimary,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

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

          <div style={styles.trustCues}>
            <span style={styles.trustItem}>Secure account</span>
            <span style={styles.trustDot}>·</span>
            <span style={styles.trustItem}>Verified masters</span>
            <span style={styles.trustDot}>·</span>
            <span style={styles.trustItem}>Clear booking flow</span>
          </div>

          <div style={styles.footer}>
            <span style={styles.footerText}>Already have an account?</span>
            <button
              style={styles.linkButton}
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>

          <button
            style={{
              ...styles.browseLink,
              color: browseHover ? "#2563eb" : undefined,
            }}
            onClick={() => navigate("/masters")}
            onMouseEnter={() => setBrowseHover(true)}
            onMouseLeave={() => setBrowseHover(false)}
          >
            Browse masters first →
          </button>
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
    background: "linear-gradient(145deg, #1e3a5f 0%, #234876 50%, #2d5a87 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px",
    color: "white",
    position: "relative",
    overflow: "hidden",
  },
  leftOverlay: {
    position: "absolute",
    inset: 0,
    background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  branding: {
    maxWidth: "420px",
    position: "relative",
    zIndex: 1,
  },
  brandTitle: {
    fontSize: "42px",
    fontWeight: 700,
    marginBottom: "16px",
    lineHeight: 1.2,
  },
  brandSubtitle: {
    fontSize: "18px",
    lineHeight: 1.6,
    marginBottom: "28px",
    opacity: 0.92,
  },
  featuresCard: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: "12px",
    padding: "20px 22px",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  features: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "17px",
  },
  checkmark: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#27ae60",
  },
  flowHint: {
    marginTop: "16px",
    fontSize: "13px",
    opacity: 0.88,
    letterSpacing: "0.03em",
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "linear-gradient(180deg, #f1f3f5 0%, #e9ecef 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "36px 40px",
    borderRadius: "16px",
    background: "white",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  secureBadge: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: 600,
    color: "#27ae60",
    letterSpacing: "0.05em",
    marginBottom: "16px",
    textTransform: "uppercase",
  },
  title: {
    fontSize: "26px",
    fontWeight: 700,
    marginBottom: "8px",
    color: "#1a1a2e",
  },
  subtitle: {
    fontSize: "15px",
    color: "#6c757d",
    marginBottom: "28px",
    lineHeight: 1.5,
  },
  button: {
    padding: "14px",
    fontSize: "16px",
    fontWeight: 600,
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    width: "100%",
  },
  buttonPrimary: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "24px 0",
    gap: "16px",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#dee2e6",
  },
  dividerText: {
    fontSize: "13px",
    color: "#868e96",
    whiteSpace: "nowrap",
    fontWeight: 500,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
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
    padding: "12px 14px",
    fontSize: "15px",
    borderRadius: "8px",
    border: "1px solid #dee2e6",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  },
  trustCues: {
    marginTop: "20px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    color: "#95a5a6",
  },
  trustItem: {},
  trustDot: {
    opacity: 0.6,
  },
  footer: {
    marginTop: "24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    paddingTop: "24px",
    borderTop: "1px solid #e9ecef",
  },
  browseLink: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    background: "none",
    border: "none",
    padding: 0,
    color: "#6c757d",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
    gap: "4px",
    transition: "color 0.2s ease",
  },
  footerText: {
    fontSize: "14px",
    color: "#7f8c8d",
  },
  linkButton: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#2563eb",
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
