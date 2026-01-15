import express from "express";
import { passport } from "../middleware/passport";
import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";

export const googleRouter = express.Router();

googleRouter.get("/google", async (req, res, next) => {
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

  passport.authenticate("google", {
    scope: scopes,
    accessType: "offline",
    prompt: needsCalendarConsent ? "consent" : "select_account",
    state: Buffer.from(
      JSON.stringify({ role: isMaster ? "master" : "student" })
    ).toString("base64"),
  })(req, res, next);
});

// Callback
googleRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Successful login
    const redirectUrl =
      process.env.ENV === "production"
        ? "https://chesswithmasters.com/home"
        : "http://localhost:3000/home";
    res.redirect(redirectUrl); // or redirect to your frontend
  }
);
