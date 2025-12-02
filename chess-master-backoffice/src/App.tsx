import { useEffect, useState } from "react";
import { AdminApi, type Admin } from "./api";
import { LoginPanel } from "./components/LoginPanel";
import { AdminLayout } from "./components/AdminLayout";
import { UsersPage } from "./pages/UsersPage";

export default function App() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState("users");

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

  return (
    <AdminLayout
      admin={admin}
      activeKey={activePage}
      onNavigate={(key) => setActivePage(key)}
      onLogout={handleLogout}
    >
      {error ? <div className="error">{error}</div> : null}
      {activePage === "users" ? <UsersPage /> : null}
    </AdminLayout>
  );
}
