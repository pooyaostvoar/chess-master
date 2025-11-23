import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

const Layout: React.FC = () => {
  const navigate = useNavigate();

  // Example: user from localStorage or global state
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const firstLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "?";

  const [open, setOpen] = useState(false);

  return (
    <div style={styles.container}>
      {/* -------- NAVBAR -------- */}
      <nav style={styles.nav}>
        <div style={styles.leftLinks}>
          <Link to="/home" style={styles.link}>
            Home
          </Link>
          <Link to="/masters" style={styles.link}>
            Masters
          </Link>
        </div>

        {/* -------- PROFILE AVATAR -------- */}
        <div style={styles.profileWrapper}>
          <div style={styles.avatar} onClick={() => setOpen(!open)}>
            {firstLetter}
          </div>

          {open && (
            <div style={styles.dropdown}>
              <button
                style={styles.dropdownItem}
                onClick={() => {
                  setOpen(false);
                  navigate("/edit-profile");
                }}
              >
                Edit Profile
              </button>

              <button
                style={styles.dropdownItem}
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* -------- MAIN CONTENT -------- */}
      <main style={styles.main}>
        <Outlet />
      </main>

      <footer style={styles.footer}>
        Chess Master © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Layout;
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#f5f6fa",
  },

  nav: {
    background: "#4a90e2",
    padding: "12px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftLinks: {
    display: "flex",
    gap: "15px",
  },

  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: 16,
  },

  profileWrapper: {
    position: "relative",
  },

  avatar: {
    width: 38,
    height: 38,
    background: "white",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#4a90e2",
    fontWeight: "bold",
    fontSize: 18,
    cursor: "pointer",
    userSelect: "none",
  },

  dropdown: {
    position: "absolute",
    right: 0,
    top: "48px",
    background: "#fff",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    width: 150,
    overflow: "hidden",
    zIndex: 10,
  },

  dropdownItem: {
    padding: "10px 15px",
    width: "100%",
    background: "white",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: 14,
  },

  main: {
    flex: 1,
    padding: "20px",
  },

  footer: {
    textAlign: "center",
    padding: 15,
    background: "#eee",
    marginTop: 20,
  },
};
