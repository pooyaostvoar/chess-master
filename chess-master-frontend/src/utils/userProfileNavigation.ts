import type { NavigateFunction } from "react-router-dom";

export type UserProfileRef = {
  id: number;
  username?: string;
  isMaster?: boolean;
  title?: string | null;
};

function resolveIsMaster(
  user: UserProfileRef,
  isMaster?: boolean
): boolean {
  if (isMaster !== undefined) return isMaster;
  if (user.isMaster !== undefined) return user.isMaster;
  return Boolean(user.title);
}

export function getUserProfilePath(
  user: UserProfileRef | null | undefined,
  isMaster?: boolean
): string | null {
  if (!user?.id) return null;

  if (resolveIsMaster(user, isMaster) && user.username) {
    return `/master-profile/${encodeURIComponent(user.username)}`;
  }

  return `/users/${user.id}`;
}

export function navigateToUserProfile(
  navigate: NavigateFunction,
  user: UserProfileRef | null | undefined,
  isMaster?: boolean
): void {
  const path = getUserProfilePath(user, isMaster);
  if (path) navigate(path);
}
