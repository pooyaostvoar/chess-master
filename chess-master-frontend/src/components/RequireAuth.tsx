import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

/**
 * Renders children only when the user is authenticated.
 * Otherwise redirects to `/login` with `redirect` set to the current path (including query string).
 */
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="bg-[#FAF5EB] min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.id) {
    const returnTo = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};
