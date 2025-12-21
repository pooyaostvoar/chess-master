import express from "express";
import { passport } from "../middleware/passport";

export const googleRouter = express.Router();

// Start login
googleRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback
googleRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("Google login successful redirect to home");
    // Successful login
    const redirectUrl =
      process.env.ENV === "production"
        ? "https://chesswithmasters.com/home"
        : "http://localhost:3000/home";
    res.redirect(redirectUrl); // or redirect to your frontend
  }
);
