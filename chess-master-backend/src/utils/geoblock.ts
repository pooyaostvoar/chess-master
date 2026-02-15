/**
 * Geoblocking for Stripe sanctions compliance.
 * Blocks users in prohibited jurisdictions per OFAC/global sanctions:
 * Cuba, Iran, North Korea, Syria, Crimea, Luhansk, Donetsk.
 *
 * @see https://stripe.com/docs/treasury/treasury-accounts/restricted-countries
 */

import type { Request } from "express";
import geoip from "geoip-lite";

/** ISO 3166-1 alpha-2 country codes for fully blocked countries */
const BLOCKED_COUNTRIES = ["CU", "IR", "KP", "SY"] as const; // Cuba, Iran, North Korea, Syria

/** Russia - blocks Crimea when geo DB attributes it to Russia */
const RUSSIA_CODE = "RU";

/**
 * Ukrainian regions to block (Crimea, Luhansk, Donetsk).
 * geoip-lite/MaxMind may return region as:
 * - ISO 3166-2 numeric: "43" (Crimea), "09" (Luhansk), "14" (Donetsk)
 * - Or region names (various spellings)
 */
const BLOCKED_UA_REGIONS = [
  "43", // Crimea (Autonomous Republic)
  "40", // Sevastopol (city in Crimea)
  "09", // Luhansk Oblast
  "14", // Donetsk Oblast
  "crimea",
  "krym",
  "luhansk",
  "luhans'k",
  "donetsk",
  "donets'k",
  "sevastopol",
];

/**
 * Extracts the client IP from the request.
 * Handles X-Forwarded-For and X-Real-IP when behind reverse proxy.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).trim();
  }
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string") {
    return realIp.trim();
  }
  return req.socket?.remoteAddress ?? req.ip ?? "";
}

/**
 * Checks if an IP is in a prohibited jurisdiction.
 * Returns { blocked: true, reason } if blocked, { blocked: false } otherwise.
 */
export function isIpInProhibitedJurisdiction(ip: string): {
  blocked: boolean;
  reason?: string;
} {
  // Skip geoblocking when disabled (e.g. local dev)
  if (process.env.GEOBLOCK_DISABLED === "1") {
    return { blocked: false };
  }

  // Normalize IPv4-mapped IPv6 (e.g. ::ffff:192.168.1.1 -> 192.168.1.1)
  const ipNorm = ip.includes("::ffff:") ? ip.split("::ffff:")[1] ?? ip : ip;

  // Skip geoblocking for localhost/private IPs (dev/test)
  if (
    !ipNorm ||
    ip === "::1" ||
    ipNorm === "127.0.0.1" ||
    ipNorm.startsWith("127.") ||
    ipNorm.startsWith("192.168.") ||
    ipNorm.startsWith("10.") ||
    ipNorm.startsWith("172.16.")
  ) {
    return { blocked: false };
  }

  const lookup = geoip.lookup(ip);
  if (!lookup) {
    // Cannot determine location - allow (fail open for UX; optional: fail closed)
    return { blocked: false };
  }

  const country = (lookup.country ?? "").toUpperCase();
  const region = (lookup.region ?? "").toLowerCase();

  // Block entire countries
  if (BLOCKED_COUNTRIES.includes(country as (typeof BLOCKED_COUNTRIES)[number])) {
    const names: Record<string, string> = {
      CU: "Cuba",
      IR: "Iran",
      KP: "North Korea",
      SY: "Syria",
    };
    return {
      blocked: true,
      reason: `Access from ${names[country] ?? country} is not permitted.`,
    };
  }

  // Block Russia (covers Crimea in many geo databases)
  if (country === RUSSIA_CODE) {
    return {
      blocked: true,
      reason: "Access from this region is not permitted due to sanctions compliance.",
    };
  }

  // Block specific Ukrainian regions (Crimea, Luhansk, Donetsk)
  if (country === "UA") {
    const regionNorm = region.toLowerCase().replace(/\s/g, "");
    for (const blocked of BLOCKED_UA_REGIONS) {
      if (regionNorm.includes(blocked.toLowerCase()) || region === blocked) {
        return {
          blocked: true,
          reason: "Access from this region is not permitted due to sanctions compliance.",
        };
      }
    }
  }

  return { blocked: false };
}

/**
 * Middleware that blocks requests from prohibited jurisdictions.
 * Use on payment/checkout routes.
 */
export function geoblockPaymentMiddleware(
  req: Request,
  res: import("express").Response,
  next: import("express").NextFunction
): void {
  const ip = getClientIp(req);
  const { blocked, reason } = isIpInProhibitedJurisdiction(ip);

  if (blocked) {
    res.status(403).json({
      error: reason ?? "Access from your region is not permitted.",
      code: "GEOBLOCKED",
    });
    return;
  }

  next();
}
