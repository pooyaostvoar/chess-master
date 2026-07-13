export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3004";
export const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "http://localhost:3004";
export const MEDIA_URL =
  process.env.REACT_APP_MEDIA_URL || "http://localhost:9000/images";

// Canonical origin used in SEO metadata (canonical links, OG/Twitter URLs,
// sitemap, JSON-LD). Override with REACT_APP_SITE_URL for staging so we
// never emit production URLs from a preview environment.
export const SITE_URL = (
  process.env.REACT_APP_SITE_URL || "https://chesswithmasters.com"
).replace(/\/+$/, "");

export const getMediaUrl = (pathOrUrl: string | null | undefined) =>
  !pathOrUrl
    ? ""
    : pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")
    ? pathOrUrl
    : MEDIA_URL + pathOrUrl;

export const absoluteUrl = (path: string): string => {
  if (!path) return SITE_URL + "/";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${suffix}`;
};
