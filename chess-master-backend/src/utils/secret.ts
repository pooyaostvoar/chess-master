import fs from "fs";

export const readSecret = (filePath: string) => {
  try {
    return fs.readFileSync(filePath, "utf-8").trim();
  } catch (err) {
    return undefined;
  }
};

let googleClientIDCache: string | undefined = undefined;
export function getGoogleCleintID() {
  if (googleClientIDCache) {
    return googleClientIDCache;
  }
  googleClientIDCache =
    readSecret("/run/secrets/google_client_id") ?? "google-client-id-not-set";
  // if (!googleClientIDCache) {
  //   throw new Error("Google Client ID not found in secrets");
  // }
  return googleClientIDCache;
}

let secretCache: string | undefined = undefined;
export function getGoogleClientSecret() {
  if (secretCache) {
    return secretCache;
  }
  secretCache =
    readSecret("/run/secrets/google_client_secret") ??
    "google-client-secret-not-set";
  // if (!secretCache) {
  //   throw new Error("Google Client Secret not found in secrets");
  // }
  return secretCache;
}

let openAiApiKeyCache: string | undefined;

export function getOpenAiApiKey(): string | undefined {
  if (openAiApiKeyCache !== undefined) {
    return openAiApiKeyCache || undefined;
  }
  openAiApiKeyCache =
    readSecret("/run/secrets/openai_api_key") ??
    process.env.OPENAI_API_KEY ??
    "";
  return openAiApiKeyCache || undefined;
}

let lokiCredentialsCache:
  | { host: string; username: string; password: string }
  | null
  | undefined;

function normalizeLokiHost(host: string) {
  return host
    .trim()
    .replace(/\/loki\/api\/v1\/push\/?$/i, "")
    .replace(/\/$/, "");
}

export function getLokiCredentials(): {
  host: string;
  username: string;
  password: string;
} | null {
  if (lokiCredentialsCache !== undefined) {
    return lokiCredentialsCache;
  }

  const host = readSecret("/run/secrets/loki_host");
  const username = readSecret("/run/secrets/loki_user");
  const password = readSecret("/run/secrets/loki_token");

  if (!host || !username || !password) {
    lokiCredentialsCache = null;
    return null;
  }

  lokiCredentialsCache = {
    host: normalizeLokiHost(host),
    username,
    password,
  };
  return lokiCredentialsCache;
}

let tempoCredentialsCache:
  | { endpoint: string; username: string; password: string }
  | null
  | undefined;

function normalizeTempoEndpoint(endpoint: string) {
  return endpoint
    .trim()
    .replace(/\/v1\/traces\/?$/i, "")
    .replace(/\/$/, "");
}

export function getTempoCredentials(): {
  endpoint: string;
  username: string;
  password: string;
} | null {
  if (tempoCredentialsCache !== undefined) {
    return tempoCredentialsCache;
  }

  const endpoint = readSecret("/run/secrets/tempo_host");
  const username =
    readSecret("/run/secrets/tempo_user") ??
    readSecret("/run/secrets/loki_user");
  const password =
    readSecret("/run/secrets/tempo_token") ??
    readSecret("/run/secrets/loki_token");

  if (!endpoint || !username || !password) {
    tempoCredentialsCache = null;
    return null;
  }

  tempoCredentialsCache = {
    endpoint: normalizeTempoEndpoint(endpoint),
    username,
    password,
  };
  return tempoCredentialsCache;
}
