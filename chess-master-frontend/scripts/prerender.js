/* eslint-disable no-console */
// Prerenders the built SPA to static per-route HTML (npm "postbuild" hook), so
// non-JS crawlers and social scrapers get real content and per-page <title> /
// canonical / OG tags instead of the generic shell.
//
// Why not react-snap? It bundles puppeteer@1.x whose 2019 Chromium can't launch
// on modern Node — it's abandoned. This does the same job with maintained
// puppeteer: serve build/, visit each route, save the rendered HTML.
//
// Routes come from public/sitemap.xml (written by the prebuild step), so the
// prerendered set always matches the sitemap: static pages + master profiles +
// blog posts. Output goes to build/<route>/index.html, which the nginx
// `try_files $uri $uri/ /index.html` rule serves.

const fs = require("fs");
const path = require("path");
const http = require("http");

const BUILD_DIR = path.resolve(__dirname, "..", "build");
const SITEMAP = path.resolve(__dirname, "..", "public", "sitemap.xml");
const NAV_TIMEOUT_MS = 20000;
const IDLE_TIMEOUT_MS = 8000; // max wait for API/data calls to settle
const SETTLE_MS = 750; // small extra wait after network idle for late effects

// The API base baked into the build (CRA inlines this at build time). The app
// calls it with absolute URLs from a different origin than our local prerender
// server, so the browser would block those XHRs on CORS and every data-driven
// page would render its "not found" state. We intercept requests to this base
// and fulfill them via a server-side fetch (no CORS), echoing the page origin
// so credentialed requests are accepted.
const API_URL = (
  process.env.REACT_APP_API_URL || "http://localhost:3004"
).replace(/\/+$/, "");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function readRoutesFromSitemap() {
  const routes = new Set(["/"]);
  try {
    const xml = fs.readFileSync(SITEMAP, "utf8");
    const re = /<loc>([^<]+)<\/loc>/g;
    let m;
    while ((m = re.exec(xml))) {
      try {
        routes.add(new URL(m[1]).pathname || "/");
      } catch (_) {
        /* ignore malformed loc */
      }
    }
  } catch (err) {
    console.warn(`[prerender] Could not read sitemap (${err.message}); prerendering "/" only.`);
  }
  return [...routes];
}

// Static server for build/, with SPA fallback to the ORIGINAL index.html shell.
// The shell is held in memory so the per-route files we write don't get served
// back as the fallback mid-run.
function startServer(shellHtml) {
  const server = http.createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    } catch (_) {
      urlPath = req.url;
    }
    const filePath = path.join(BUILD_DIR, urlPath);
    // Serve a real asset when one exists; otherwise hand back the SPA shell.
    if (
      filePath.startsWith(BUILD_DIR) &&
      urlPath !== "/" &&
      fs.existsSync(filePath) &&
      fs.statSync(filePath).isFile()
    ) {
      res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(shellHtml);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

// Fulfill requests to the API base via a server-side fetch (bypassing browser
// CORS), so data-driven pages actually render their content during prerender.
// Everything else is left to load normally from our static server.
async function proxyApiRequest(req, pageOrigin) {
  const url = req.url();
  if (!url.startsWith(API_URL)) {
    req.continue().catch(() => {});
    return;
  }
  // Answer the CORS preflight ourselves.
  if (req.method() === "OPTIONS") {
    req
      .respond({
        status: 204,
        headers: {
          "access-control-allow-origin": pageOrigin,
          "access-control-allow-credentials": "true",
          "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
          "access-control-allow-headers": "content-type,authorization",
        },
      })
      .catch(() => {});
    return;
  }
  try {
    const upstream = await fetch(url, {
      method: req.method(),
      headers: { Accept: "application/json" },
    });
    const body = Buffer.from(await upstream.arrayBuffer());
    req
      .respond({
        status: upstream.status,
        headers: {
          "content-type": upstream.headers.get("content-type") || "application/json",
          "access-control-allow-origin": pageOrigin,
          "access-control-allow-credentials": "true",
        },
        body,
      })
      .catch(() => {});
  } catch (_) {
    req.continue().catch(() => {});
  }
}

function outFileFor(route) {
  if (route === "/") return path.join(BUILD_DIR, "index.html");
  const segments = route.split("/").filter(Boolean).map((s) => decodeURIComponent(s));
  return path.join(BUILD_DIR, ...segments, "index.html");
}

async function main() {
  const shellPath = path.join(BUILD_DIR, "index.html");
  if (!fs.existsSync(shellPath)) {
    throw new Error(`build/index.html not found — run the build first (${shellPath})`);
  }
  const shellHtml = fs.readFileSync(shellPath, "utf8");
  const routes = readRoutesFromSitemap();

  // Require puppeteer lazily so a missing install gives a clear message.
  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch (_) {
    throw new Error('puppeteer is not installed — run "pnpm install"');
  }

  const server = await startServer(shellHtml);
  const { port } = server.address();
  const origin = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const rendered = [];
  let ok = 0;
  let failed = 0;
  try {
    for (const route of routes) {
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      page.on("request", (req) => proxyApiRequest(req, origin));
      try {
        // domcontentloaded won't throw on a lingering socket; we then wait for
        // network idle but tolerate it never settling (socket.io stays open).
        await page.goto(`${origin}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: NAV_TIMEOUT_MS,
        });
        await page
          .waitForNetworkIdle({ idleTime: 500, timeout: IDLE_TIMEOUT_MS, concurrency: 2 })
          .catch(() => {});
        await new Promise((r) => setTimeout(r, SETTLE_MS));
        const html = await page.content();
        rendered.push({ route, html });
        ok += 1;
        console.log(`[prerender] ✓ ${route}`);
      } catch (err) {
        failed += 1;
        console.warn(`[prerender] ✗ ${route} — ${err.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  // Write everything after rendering so nothing we emit is served as the shell.
  for (const { route, html } of rendered) {
    const file = outFileFor(route);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `<!doctype html>${html}`, "utf8");
  }

  console.log(`[prerender] Done: ${ok} prerendered, ${failed} failed, of ${routes.length} routes.`);
  // Don't fail the build on individual page misses; a missing prerender simply
  // falls back to client-side rendering via nginx. Only a total wipeout is fatal.
  if (ok === 0 && routes.length > 0) {
    throw new Error("prerendered 0 routes");
  }
}

main().catch((err) => {
  console.error(`[prerender] Failed: ${err && err.message}`);
  process.exit(1);
});
