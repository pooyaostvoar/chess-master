import { useEffect, useState } from "react";
import { AdminApi, type Admin } from "./api";
import { LoginPanel } from "./components/LoginPanel";
import { AdminLayout } from "./components/AdminLayout";
import { UsersPage } from "./pages/UsersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { UserDetailPage } from "./pages/UserDetailPage";

export default function App() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    AdminApi.me()
      .then((res) => setAdmin(res))
      .catch(() => {
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      await AdminApi.logout();
      setAdmin(null);
    } catch (err: any) {
      setError(err.message || "Logout failed");
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p className="muted">Checking admin session…</p>
      </div>
    );
  }

  if (!admin) {
    return <LoginPanel onLogin={setAdmin} />;
  }

  const pageTitle =
    activePage === "dashboard"
      ? "Dashboard"
      : activePage === "users"
      ? "User Management"
      : activePage === "userDetail"
      ? "User Detail"
      : "";

  return (
    <AdminLayout
      admin={admin}
      activeKey={activePage}
      onNavigate={(key) => setActivePage(key)}
      onLogout={handleLogout}
      pageTitle={pageTitle}
    >
      {error ? <div className="error">{error}</div> : null}
      {activePage === "dashboard" ? <DashboardPage /> : null}
      {activePage === "users" ? (
        <UsersPage
          onSelectUser={(user) => {
            setSelectedUserId(user.id);
            setActivePage("userDetail");
          }}
        />
      ) : null}
      {activePage === "userDetail" && selectedUserId !== null ? (
        <UserDetailPage
          userId={selectedUserId}
          onBack={() => {
            setSelectedUserId(null);
            setActivePage("users");
          }}
        />
      ) : null}
    </AdminLayout>
  );
}
