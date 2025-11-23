import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../services/auth";
import { useUser } from "../contexts/UserContext";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const firstLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "?";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>♔</span>
            <span style={styles.logoText}>Chess Master</span>
          </div>

          <div style={styles.navLinks}>
            <Link to="/home" style={styles.link}>
              Home
            </Link>
            <Link to="/masters" style={styles.link}>
              Browse Masters
            </Link>
          </div>

          <div style={styles.profileWrapper}>
            <div style={styles.avatar} onClick={() => setOpen(!open)}>
              {firstLetter}
            </div>

            {open && (
              <>
                <div style={styles.overlay} onClick={() => setOpen(false)} />
                <div style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <div style={styles.dropdownAvatar}>{firstLetter}</div>
                    <div>
                      <div style={styles.dropdownName}>{user?.username}</div>
                      <div style={styles.dropdownRole}>
                        {user?.isMaster ? "Master" : "Player"}
                      </div>
                    </div>
                  </div>

                  <div style={styles.divider} />

                  <button
                    style={styles.dropdownItem}
                    onClick={() => {
                      setOpen(false);
                      navigate("/edit-profile");
                    }}
                  >
                    <span>👤</span>
                    <span>Edit Profile</span>
                  </button>

                  {user?.isMaster && (
                    <button
                      style={styles.dropdownItem}
                      onClick={() => {
                        setOpen(false);
                        navigate(`/calender/${user.id}`);
                      }}
                    >
                      <span>📅</span>
                      <span>My Schedule</span>
                    </button>
                  )}

                  <div style={styles.divider} />

                  <button
                    style={{ ...styles.dropdownItem, ...styles.logoutItem }}
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        <Outlet />
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <span style={styles.footerLogo}>♔ Chess Master</span>
          </div>
          <div style={styles.footerText}>
            © {new Date().getFullYear()} Chess Master. All rights reserved.
          </div>
        </div>
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
    background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "white",
    fontSize: "20px",
    fontWeight: 700,
  },
  logoIcon: {
    fontSize: "28px",
  },
  logoText: {
    letterSpacing: "0.5px",
  },
  navLinks: {
    display: "flex",
    gap: "32px",
    alignItems: "center",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "15px",
    transition: "all 0.2s ease",
    position: "relative",
    padding: "8px 0",
  },
  profileWrapper: {
    position: "relative",
  },
  avatar: {
    width: "44px",
    height: "44px",
    background: "white",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#2c3e50",
    fontWeight: 700,
    fontSize: "18px",
    cursor: "pointer",
    userSelect: "none",
    transition: "all 0.2s ease",
    border: "3px solid transparent",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 98,
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "56px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    width: "260px",
    overflow: "hidden",
    zIndex: 99,
  },
  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px",
    background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
    color: "white",
  },
  dropdownAvatar: {
    width: "48px",
    height: "48px",
    background: "white",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#3498db",
    fontWeight: 700,
    fontSize: "20px",
  },
  dropdownName: {
    fontWeight: 600,
    fontSize: "16px",
  },
  dropdownRole: {
    fontSize: "13px",
    opacity: 0.9,
    marginTop: "2px",
  },
  divider: {
    height: "1px",
    background: "#e0e0e0",
  },
  dropdownItem: {
    padding: "14px 20px",
    width: "100%",
    background: "white",
    border: "none",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 500,
    color: "#2c3e50",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    transition: "all 0.2s ease",
  },
  logoutItem: {
    color: "#e74c3c",
  },
  main: {
    flex: 1,
  },
  footer: {
    background: "#2c3e50",
    color: "white",
    padding: "32px 24px",
    marginTop: "auto",
  },
  footerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  footerLogo: {
    fontSize: "18px",
    fontWeight: 700,
  },
  footerText: {
    fontSize: "14px",
    opacity: 0.8,
  },
};
