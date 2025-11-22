import express, { Request, Response } from "express";
import { AppDataSource } from "../database/datasource";
import { passport } from "../middleware/passport";

export const googleRouter = express.Router();

googleRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication, redirect home.
    // res.redirect("/");
    res.send({ ok: "done" });
  }
);

googleRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
googleRouter.get("/login/federated/google", passport.authenticate("google"));
