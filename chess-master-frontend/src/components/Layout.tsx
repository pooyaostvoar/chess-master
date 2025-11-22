import React from "react";
import { Link, Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>
          Home
        </Link>
        <Link to="/game/new" style={styles.link}>
          New Game
        </Link>
        <Link to="/login" style={styles.link}>
          Login
        </Link>
      </nav>

      <main style={styles.main}>
        <Outlet /> {/* Route content appears here */}
      </main>

      <footer style={styles.footer}>
        Chess Master © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    background: "#f5f6fa",
  },
  nav: {
    background: "#4a90e2",
    padding: "12px 20px",
    display: "flex",
    gap: "15px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: 500,
  },
  main: {
    flex: 1,
    padding: "20px",
  },
  footer: {
    textAlign: "center" as const,
    padding: "15px",
    background: "#eee",
    marginTop: "20px",
  },
};

export default Layout;
