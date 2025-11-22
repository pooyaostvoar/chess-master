import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

const Login: React.FC = () => {
  console.log("Rendering Login component");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(username, password);

      if (data.status === "success") {
        setMessage("Login successful!");
        navigate("/");
      } else {
        setMessage("Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error logging in");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don't have an account?</span>
          <button style={styles.linkButton} onClick={() => navigate("/signup")}>
            Create Account
          </button>
        </div>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#f5f6fa",
  },
  card: {
    width: "350px",
    padding: "30px",
    borderRadius: "12px",
    background: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  label: {
    fontSize: "14px",
    color: "#555",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    outline: "none",
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    background: "#4a90e2",
    color: "white",
    fontSize: "16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  footer: {
    marginTop: "15px",
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    fontSize: "14px",
    color: "#555",
  },
  linkButton: {
    background: "none",
    border: "none",
    padding: 0,
    color: "#4a90e2",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "14px",
  },
  message: {
    marginTop: "15px",
    textAlign: "center",
    color: "#e74c3c",
  },
};

export default Login;
