import express from "express";
import { passport } from "../middleware/passport";
import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";
import { geoblockPaymentMiddleware } from "../utils/geoblock";
import { safeRedirectPath } from "../utils/safeRedirectPath";

export const googleRouter = express.Router();

const getFrontendBaseUrl = () =>
  process.env.ENV === "production"
    ? "https://chesswithmasters.com"
    : "http://localhost:3000";

googleRouter.get("/google", geoblockPaymentMiddleware, async (req, res, next) => {
  const roleFromUI = req.query.role === "master";
  const emailHint = req.query.email as string | undefined;

  let isMaster = roleFromUI;
  let needsCalendarConsent = false;

  if (emailHint) {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email: emailHint } });

    if (user?.isMaster) {
      isMaster = true;

      // 🔥 MASTER but no refresh token → ask again
      if (!user.googleRefreshToken) {
        needsCalendarConsent = true;
      }
    }
  }

  const scopes = ["profile", "email"];

  if (isMaster) {
    scopes.push("https://www.googleapis.com/auth/calendar.events");
  }

  const postLoginPath = safeRedirectPath(req.query.redirect);
  const statePayload: { role: string; redirect?: string } = {
    role: isMaster ? "master" : "student",
  };
  if (postLoginPath) {
    statePayload.redirect = postLoginPath;
  }

  passport.authenticate("google", {
    scope: scopes,
    accessType: "offline",
    prompt: needsCalendarConsent ? "consent" : "select_account",
    state: Buffer.from(JSON.stringify(statePayload)).toString("base64"),
  })(req, res, next);
});

// Callback
googleRouter.get(
  "/google/callback",
  geoblockPaymentMiddleware,
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    let path = "/home";
    try {
      const stateStr = req.query.state;
      if (typeof stateStr === "string" && stateStr) {
        const parsed = JSON.parse(
          Buffer.from(stateStr, "base64").toString()
        ) as { redirect?: unknown };
        const safe = safeRedirectPath(parsed?.redirect);
        if (safe) {
          path = safe;
        }
      }
    } catch {
      // use default /home
    }
    res.redirect(`${getFrontendBaseUrl()}${path}`);
  }
);
