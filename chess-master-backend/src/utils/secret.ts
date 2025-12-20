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
