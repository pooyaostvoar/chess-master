import express from "express";
import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";
import { UserStatus } from "../database/entity/types";
import { sendWelcomeEmail } from "../services/brevo_email";
import {
  buildLichessProfileUrl,
  createLichessState,
  createPkceChallenge,
  createPkceVerifier,
  getLichessRatings,
  LichessAccount,
  LichessEmailResponse,
  LichessTokenResponse,
  parseLichessState,
} from "../services/lichess";
import { safeRedirectPath } from "../utils/safeRedirectPath";

export const lichessRouter = express.Router();

const LICHESS_HOST = "https://lichess.org";

const getBackendBaseUrl = () =>
  process.env.ENV === "production"
    ? "https://chesswithmasters.com/api"
    : "http://localhost:3004";

const getFrontendBaseUrl = () =>
  process.env.ENV === "production"
    ? "https://chesswithmasters.com"
    : "http://localhost:3000";

const getCallbackUrl = () => `${getBackendBaseUrl()}/auth/lichess/callback`;

const getClientId = () =>
  process.env.LICHESS_CLIENT_ID ??
  (process.env.ENV === "production"
    ? "chesswithmasters.com"
    : "localhost-chess-master");

const buildFrontendErrorUrl = (
  mode: "login" | "signup" | "link",
  errorCode: string
) => {
  const path =
    mode === "signup" ? "/signup" : mode === "link" ? "/edit-profile" : "/login";
  return `${getFrontendBaseUrl()}${path}?error=${encodeURIComponent(errorCode)}`;
};

const buildFrontendSuccessUrl = (
  mode: "login" | "signup" | "link",
  redirectPath?: string | null
) => {
  if (mode === "link") {
    return `${getFrontendBaseUrl()}/edit-profile?status=lichess_synced`;
  }
  const path = redirectPath ?? "/home";
  return `${getFrontendBaseUrl()}${path}`;
};

async function exchangeAuthorizationCode(code: string, codeVerifier: string) {
  const response = await fetch(`${LICHESS_HOST}/api/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      redirect_uri: getCallbackUrl(),
      client_id: getClientId(),
      code,
      code_verifier: codeVerifier,
    }),
  });

  const data = (await response.json()) as LichessTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Token exchange failed");
  }

  return data.access_token;
}

async function fetchLichessJson<T>(path: string, accessToken: string) {
  const response = await fetch(`${LICHESS_HOST}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Lichess request failed for ${path} (${response.status})`);
  }

  return (await response.json()) as T;
}

async function getUniqueUsername(
  preferredUsername: string,
  currentUserId?: number
): Promise<string> {
  const userRepo = AppDataSource.getRepository(User);
  const baseUsername = preferredUsername.trim();

  let candidate = baseUsername;
  let suffix = 1;

  while (true) {
    const existing = await userRepo.findOne({
      where: { username: candidate },
      select: ["id"],
    });

    if (!existing || existing.id === currentUserId) {
      return candidate;
    }

    candidate = `${baseUsername}_${suffix}`;
    suffix += 1;
  }
}

lichessRouter.get("/lichess", async (req, res) => {
  const mode =
    req.query.mode === "signup"
      ? "signup"
      : req.query.mode === "link"
      ? "link"
      : "login";

  if (mode === "link" && !(req.isAuthenticated && req.isAuthenticated())) {
    return res.redirect(
      `${getFrontendBaseUrl()}/login?redirect=${encodeURIComponent(
        "/edit-profile"
      )}&error=lichess_link_requires_login`
    );
  }

  const codeVerifier = createPkceVerifier();
  const codeChallenge = createPkceChallenge(codeVerifier);
  const postLoginPath = safeRedirectPath(req.query.redirect);
  const state = createLichessState({
    mode,
    ...(postLoginPath ? { redirect: postLoginPath } : {}),
  });

  (req.session as any).lichessOauth = {
    codeVerifier,
    state,
  };

  const params = new URLSearchParams({
    response_type: "code",
    client_id: getClientId(),
    redirect_uri: getCallbackUrl(),
    scope: "email:read",
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    state,
  });

  res.redirect(`${LICHESS_HOST}/oauth?${params.toString()}`);
});

lichessRouter.get(
  "/lichess/callback",
  async (req, res, next) => {
    const sessionOauth = (req.session as any).lichessOauth;
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const returnedState =
      typeof req.query.state === "string" ? req.query.state : null;
    const parsedState = returnedState ? parseLichessState(returnedState) : null;
    const mode = parsedState?.mode ?? "login";

    const fail = (errorCode: string) =>
      res.redirect(buildFrontendErrorUrl(mode, errorCode));

    if (!sessionOauth?.codeVerifier || !sessionOauth?.state) {
      return fail("lichess_session_expired");
    }

    if (!code || !returnedState || returnedState !== sessionOauth.state) {
      return fail("lichess_invalid_state");
    }

    try {
      const accessToken = await exchangeAuthorizationCode(
        code,
        sessionOauth.codeVerifier
      );
      const lichessAccount = await fetchLichessJson<LichessAccount>(
        "/api/account",
        accessToken
      );
      const lichessEmail = await fetchLichessJson<LichessEmailResponse>(
        "/api/account/email",
        accessToken
      );
      const email = lichessEmail.email?.trim().toLowerCase();

      if (!email) {
        return fail("lichess_email_required");
      }

      const userRepo = AppDataSource.getRepository(User);
      const lichessRatings = getLichessRatings(lichessAccount);
      const lichessUrl = buildLichessProfileUrl(lichessAccount.username);
      let user: User | null = null;
      let isNewUser = false;

      if (mode === "link") {
        const currentUserId = (req.user as any)?.id;

        if (!currentUserId) {
          return fail("lichess_link_requires_login");
        }

        const existingLinkedUser = await userRepo.findOne({
          where: { lichessId: lichessAccount.id },
        });

        if (existingLinkedUser && existingLinkedUser.id !== currentUserId) {
          return fail("lichess_account_already_linked");
        }

        user = await userRepo.findOne({ where: { id: currentUserId } });

        if (!user) {
          return fail("lichess_link_requires_login");
        }

        user.lichessId = lichessAccount.id;
        user.lichessUsername = lichessAccount.username;
        user.lichessRatings = lichessRatings;
        user.lichessUrl = lichessUrl;
        if (lichessAccount.title) {
          user.title = lichessAccount.title;
        }
      } else {
        user = await userRepo
          .createQueryBuilder("user")
          .where("user.lichessId = :lichessId", {
            lichessId: lichessAccount.id,
          })
          .orWhere("LOWER(user.email) = LOWER(:email)", { email })
          .orWhere("LOWER(user.lichessUsername) = LOWER(:lichessUsername)", {
            lichessUsername: lichessAccount.username,
          })
          .orWhere("LOWER(user.lichessUrl) = LOWER(:lichessUrl)", {
            lichessUrl,
          })
          .getOne();

        if (!user) {
          isNewUser = true;
          user = userRepo.create({
            email,
            username: await getUniqueUsername(lichessAccount.username),
            title: lichessAccount.title ?? null,
            lichessId: lichessAccount.id,
            lichessUsername: lichessAccount.username,
            lichessRatings,
            lichessUrl,
          });
        } else {
          user.email = email;
          user.status = UserStatus.Active;
          user.lichessId = lichessAccount.id;
          user.lichessUsername = lichessAccount.username;
          user.lichessRatings = lichessRatings;
          user.lichessUrl = lichessUrl;
          if (lichessAccount.title) {
            user.title = lichessAccount.title;
          }
          if (user.username === user.email || !user.username) {
            user.username = await getUniqueUsername(
              lichessAccount.username,
              user.id
            );
          }
        }
      }

      await userRepo.save(user);

      if (isNewUser) {
        await sendWelcomeEmail({
          toEmail: user.email,
          toName: user.username,
        });
      }

      delete (req.session as any).lichessOauth;

      req.logIn(user, (error) => {
        if (error) {
          return next(error);
        }
        const successRedirect = safeRedirectPath(parsedState?.redirect);
        return res.redirect(buildFrontendSuccessUrl(mode, successRedirect));
      });
    } catch (error) {
      console.error("Lichess auth failed:", error);
      return fail("lichess_auth_failed");
    }
  }
);
