/**
 * Same-origin path only — safe for redirect query params (open-redirect safe).
 */
export function safeRedirectPath(raw: unknown): string | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
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
