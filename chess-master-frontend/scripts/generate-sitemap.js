/* eslint-disable no-console */
// Generates public/sitemap.xml at build time (wired to the npm "prebuild" hook,
// so it runs before `react-scripts build` copies public/ into build/).
//
// It pulls the dynamic content — master profiles and blog posts — from the API
// so the sitemap reflects what actually exists, instead of the old hand-written
// 7-URL file. If the API is unreachable at build time the script still writes
// the static marketing routes and exits 0, so a build never fails just because
// the API is down.
//
// Env (same vars the app uses):
//   REACT_APP_SITE_URL  canonical origin      (default https://chesswithmasters.com)
//   REACT_APP_API_URL   API base, incl. /api  (default http://localhost:3004)

const fs = require("fs");
const path = require("path");

const SITE_URL = (
  process.env.REACT_APP_SITE_URL || "https://chesswithmasters.com"
).replace(/\/+$/, "");
const API_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:3004"
).replace(/\/+$/, "");

// Public, indexable static routes. Auth-only routes are intentionally excluded
// (they are Disallow-ed in robots.txt and noindex-ed in-app).
const STATIC_ROUTES = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/masters", changefreq: "daily", priority: "0.9" },
  { path: "/upcoming-events", changefreq: "daily", priority: "0.8" },
  { path: "/events", changefreq: "weekly", priority: "0.7" },
  { path: "/posts", changefreq: "weekly", priority: "0.7" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.2" },
  { path: "/terms-of-service", changefreq: "yearly", priority: "0.2" },
];

const xmlEscape = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

async function getJson(url) {
  if (typeof fetch !== "function") {
    throw new Error("global fetch unavailable (needs Node 18+)");
  }
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function fetchMasterRoutes() {
  try {
    const data = await getJson(`${API_URL}/users?isMaster=true`);
    const users = Array.isArray(data && data.users) ? data.users : [];
    return users
      .filter((u) => u && typeof u.username === "string" && u.status !== "disabled")
      // Never publish email-like usernames in a public sitemap — some accounts
      // have an email stored as their username (a data issue to fix upstream),
      // and enumerating those here would leak PII. The username is used verbatim
      // (not trimmed) so the emitted URL still resolves to the real profile.
      .filter((u) => !u.username.includes("@"))
      .map((u) => ({
        path: `/master-profile/${encodeURIComponent(u.username)}`,
        changefreq: "weekly",
        priority: "0.8",
      }));
  } catch (err) {
    console.warn(`[sitemap] Skipping master profiles: ${err.message}`);
    return [];
  }
}

async function fetchPostRoutes() {
  const routes = [];
  try {
    const pageSize = 100;
    let page = 1;
    // Paginate defensively so we capture every published post.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const data = await getJson(
        `${API_URL}/posts?page=${page}&pageSize=${pageSize}`
      );
      const items = Array.isArray(data && data.items) ? data.items : [];
      for (const post of items) {
        if (!post || !post.slug) continue;
        let lastmod;
        if (post.createdAt) {
          const d = new Date(post.createdAt);
          if (!Number.isNaN(d.getTime())) lastmod = d.toISOString().slice(0, 10);
        }
        routes.push({
          path: `/posts/${encodeURIComponent(post.slug)}`,
          changefreq: "monthly",
          priority: "0.6",
          lastmod,
        });
      }
      const total = Number((data && data.total) != null ? data.total : items.length);
      if (items.length === 0 || page * pageSize >= total) break;
      page += 1;
    }
  } catch (err) {
    console.warn(`[sitemap] Skipping blog posts: ${err.message}`);
  }
  return routes;
}

function toUrlXml(entry) {
  const lines = [`    <loc>${xmlEscape(`${SITE_URL}${entry.path}`)}</loc>`];
  if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  if (entry.changefreq) lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  if (entry.priority) lines.push(`    <priority>${entry.priority}</priority>`);
  return `  <url>\n${lines.join("\n")}\n  </url>`;
}

async function main() {
  const [masters, posts] = await Promise.all([
    fetchMasterRoutes(),
    fetchPostRoutes(),
  ]);

  // De-dupe by path (a master could, in theory, collide with a static route).
  const seen = new Set();
  const entries = [...STATIC_ROUTES, ...masters, ...posts].filter((e) =>
    seen.has(e.path) ? false : seen.add(e.path)
  );

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.map(toUrlXml).join("\n") +
    `\n</urlset>\n`;

  const outPath = path.resolve(__dirname, "..", "public", "sitemap.xml");
  fs.writeFileSync(outPath, xml, "utf8");
  console.log(
    `[sitemap] Wrote ${entries.length} URLs to public/sitemap.xml ` +
      `(${masters.length} masters, ${posts.length} posts, ${STATIC_ROUTES.length} static).`
  );
}

main().catch((err) => {
  // Only a filesystem write failure reaches here; network errors are handled
  // above. Fail loudly so a broken build step is visible.
  console.error(`[sitemap] Failed: ${err && err.message}`);
  process.exit(1);
});
