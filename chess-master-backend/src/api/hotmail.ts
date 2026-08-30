import express from "express";
import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";
import { UserStatus } from "../database/entity/types";
import { sendWelcomeEmail } from "../services/brevo_email";
import { geoblockPaymentMiddleware } from "../utils/geoblock";
import {
  getMicrosoftClientId,
  getMicrosoftClientSecret,
} from "../utils/secret";
import { safeRedirectPath } from "../utils/safeRedirectPath";

export const hotmailRouter = express.Router();

// Personal Microsoft accounts (Hotmail, Outlook.com, Live) require /consumers/
// when the Azure app userAudience is set to "Consumer".
const MICROSOFT_AUTHORITY =
  "https://login.microsoftonline.com/consumers/oauth2/v2.0";
const MICROSOFT_GRAPH_ME = "https://graph.microsoft.com/v1.0/me";

interface MicrosoftGraphProfile {
  id: string;
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
}

interface MicrosoftTokenResponse {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

interface HotmailState {
  role?: string;
  redirect?: string;
}

const getBackendBaseUrl = () =>
  process.env.ENV === "production"
    ? "https://chesswithmasters.com/api"
    : "http://localhost:3004";

const getFrontendBaseUrl = () =>
  process.env.ENV === "production"
    ? "https://chesswithmasters.com"
    : "http://localhost:3000";

const getCallbackUrl = () => `${getBackendBaseUrl()}/auth/hotmail/callback`;

const buildFrontendErrorUrl = (errorCode: string) =>
  `${getFrontendBaseUrl()}/login?error=${encodeURIComponent(errorCode)}`;

const encodeState = (payload: HotmailState) =>
  Buffer.from(JSON.stringify(payload)).toString("base64");

const parseState = (raw: string | null): HotmailState | null => {
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString()) as HotmailState;
  } catch {
    return null;
  }
};

async function exchangeAuthorizationCode(code: string) {
  const response = await fetch(`${MICROSOFT_AUTHORITY}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: getMicrosoftClientId(),
      client_secret: getMicrosoftClientSecret(),
      grant_type: "authorization_code",
      code,
      redirect_uri: getCallbackUrl(),
      scope: "openid profile email User.Read offline_access",
    }),
  });

  const data = (await response.json()) as MicrosoftTokenResponse;

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Token exchange failed");
  }

  return data;
}

async function fetchMicrosoftProfile(
  accessToken: string
): Promise<MicrosoftGraphProfile> {
  const response = await fetch(MICROSOFT_GRAPH_ME, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Microsoft Graph request failed (${response.status})`);
  }

  return (await response.json()) as MicrosoftGraphProfile;
}

hotmailRouter.get("/hotmail", geoblockPaymentMiddleware, (req, res) => {
  const isMaster = req.query.role === "master";
  const postLoginPath = safeRedirectPath(req.query.redirect);

  const statePayload: HotmailState = {
    role: isMaster ? "master" : "student",
  };
  if (postLoginPath) {
    statePayload.redirect = postLoginPath;
  }

  const params = new URLSearchParams({
    client_id: getMicrosoftClientId(),
    response_type: "code",
    redirect_uri: getCallbackUrl(),
    response_mode: "query",
    scope: "openid profile email User.Read offline_access",
    state: encodeState(statePayload),
    prompt: "select_account",
  });

  res.redirect(`${MICROSOFT_AUTHORITY}/authorize?${params.toString()}`);
});

hotmailRouter.get(
  "/hotmail/callback",
  geoblockPaymentMiddleware,
  async (req, res, next) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    const returnedState =
      typeof req.query.state === "string" ? req.query.state : null;
    const parsedState = parseState(returnedState);

    const fail = (errorCode: string) =>
      res.redirect(buildFrontendErrorUrl(errorCode));

    const oauthError =
      typeof req.query.error === "string" ? req.query.error : null;
    if (oauthError) {
      const description =
        typeof req.query.error_description === "string"
          ? req.query.error_description
          : oauthError;
      console.error("Hotmail OAuth error:", description);
      return fail("hotmail_auth_failed");
    }

    if (!code) {
      return fail("hotmail_auth_failed");
    }

    try {
      const tokenData = await exchangeAuthorizationCode(code);
      const profile = await fetchMicrosoftProfile(tokenData.access_token!);
      const email = (profile.mail || profile.userPrincipalName || "")
        .trim()
        .toLowerCase();

      if (!email) {
        return fail("hotmail_email_required");
      }

      const userRepo = AppDataSource.getRepository(User);
      let user = await userRepo.findOne({ where: { email } });
      let isNewUser = false;
      const isMaster = parsedState?.role === "master";

      if (!user) {
        isNewUser = true;
        user = userRepo.create({
          email,
          username: email,
          microsoftId: profile.id,
          isMaster,
        });
      } else {
        if (user.status === UserStatus.Disabled) {
          return fail("hotmail_account_disabled");
        }
        user.microsoftId = profile.id;
        if (isMaster) {
          user.isMaster = true;
        }
      }

      await userRepo.save(user);

      if (isNewUser) {
        await sendWelcomeEmail({
          toEmail: user.email,
          toName: user.username,
        });
      }

      req.logIn(user, (error) => {
        if (error) {
          return next(error);
        }
        const redirectPath =
          safeRedirectPath(parsedState?.redirect) ?? "/home";
        return res.redirect(`${getFrontendBaseUrl()}${redirectPath}`);
      });
    } catch (error) {
      console.error("Hotmail auth failed:", error);
      return fail("hotmail_auth_failed");
    }
  }
);
