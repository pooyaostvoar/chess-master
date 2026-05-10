import React, { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../services/auth";
import type { LichessRatings } from "../services/api/user.api";

export interface User {
  id: number;
  username: string;
  email: string;
  name?: string | null;
  lastname?: string | null;
  isMaster: boolean;
  status?: "active" | "disabled";
  /** USD per hour; used when suggesting slot prices on the master calendar. */
  hourlyRate?: number | null;
  title?: string | null;
  rating?: number | null;
  bio?: string | null;
  chesscomUrl?: string | null;
  lichessUrl?: string | null;
  lichessRatings?: LichessRatings | null;
  profilePictureThumbnailUrl?: string | null;
  profilePictureUrl?: string | null;
}

interface UserContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getMe();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        // User is not authenticated or session expired
        if (err.response?.status === 401) {
          // Session is invalid, clear user
          setUser(null);
        } else {
          console.error("Failed to load user", err);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
