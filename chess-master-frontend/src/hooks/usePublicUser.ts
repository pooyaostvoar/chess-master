import { useState, useEffect } from "react";
import { getPublicUser } from "../services/api/user.api";

export interface PublicUser {
  id: number;
  username: string;
  profilePicture?: string;
  title?: string;
  rating?: number | null;
  languages?: string[];
  bio?: string;
  chesscomUrl?: string;
  lichessUrl?: string;
  isMaster?: boolean;
  hourlyRate?: number | null;
}

export function usePublicUser(id: number | undefined) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let isCancelled = false;

    const loadUser = async () => {
      try {
        const res = await getPublicUser(id);
        if (!isCancelled) setUser(res);
      } catch (err) {
        console.error(err);
        if (!isCancelled) setUser(null);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadUser();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  return { user, loading };
}
