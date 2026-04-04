import { createHash, randomBytes } from "crypto";

export interface LichessPerf {
  rating?: number;
  games?: number;
  rd?: number;
  prog?: number;
  prov?: boolean;
  rank?: number;
}

export type LichessRatings = Record<string, LichessPerf>;

export interface LichessAccount {
  id: string;
  username: string;
  title?: string;
  perfs?: {
    classical?: LichessPerf;
    [key: string]: LichessPerf | undefined;
  };
}

export interface LichessEmailResponse {
  email?: string;
}

export interface LichessTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

export interface LichessOAuthState {
  nonce: string;
  mode: "login" | "signup" | "link";
}

const toBase64Url = (buffer: Buffer) =>
  buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

export function createPkceVerifier() {
  return toBase64Url(randomBytes(32));
}

export function createPkceChallenge(verifier: string) {
  return toBase64Url(createHash("sha256").update(verifier).digest());
}

export function createLichessState(
  payload: Omit<LichessOAuthState, "nonce">
): string {
  const state: LichessOAuthState = {
    ...payload,
    nonce: toBase64Url(randomBytes(24)),
  };

  return toBase64Url(Buffer.from(JSON.stringify(state), "utf8"));
}

export function parseLichessState(state: string): LichessOAuthState | null {
  try {
    const normalized = state.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = Buffer.from(padded, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as Partial<LichessOAuthState>;

    if (
      parsed &&
      typeof parsed.nonce === "string" &&
      (parsed.mode === "login" ||
        parsed.mode === "signup" ||
        parsed.mode === "link")
    ) {
      return parsed as LichessOAuthState;
    }
  } catch (error) {
    console.error("Failed to parse Lichess state:", error);
  }

  return null;
}

export function getLichessRatings(account: LichessAccount): LichessRatings | null {
  if (!account.perfs) {
    return null;
  }

  const ratings = Object.entries(account.perfs).reduce<LichessRatings>(
    (acc, [key, perf]) => {
      if (!perf || !Number.isFinite(perf.rating)) {
        return acc;
      }

      acc[key] = {
        rating: Math.round(perf.rating as number),
        ...(Number.isFinite(perf.games) ? { games: Math.round(perf.games as number) } : {}),
        ...(Number.isFinite(perf.rd) ? { rd: Math.round(perf.rd as number) } : {}),
        ...(Number.isFinite(perf.prog) ? { prog: Math.round(perf.prog as number) } : {}),
        ...(typeof perf.prov === "boolean" ? { prov: perf.prov } : {}),
        ...(Number.isFinite(perf.rank) ? { rank: Math.round(perf.rank as number) } : {}),
      };

      return acc;
    },
    {}
  );

  return Object.keys(ratings).length > 0 ? ratings : null;
}

export function buildLichessProfileUrl(username: string) {
  return `https://lichess.org/@/${encodeURIComponent(username)}`;
}
