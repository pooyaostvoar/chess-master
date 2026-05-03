/**
 * Normalizes and validates an in-app path for post-login redirects.
 * Returns null for external URLs or unsafe values (open-redirect safe).
 */
export function safeRedirectPath(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let path = trimmed;
  try {
    path = decodeURIComponent(path);
  } catch {
    return null;
  }

  if (/[\r\n]|[\\]|\/\/|:\/\/|^\/\//i.test(path) || /javascript:/i.test(path)) {
    return null;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("//")) {
    return null;
  }

  return normalized;
}
