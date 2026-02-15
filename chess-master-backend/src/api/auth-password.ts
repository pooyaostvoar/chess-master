import express from "express";
import { AppDataSource } from "../database/datasource";
import { passport } from "../middleware/passport";
import { User } from "../database/entity/user";
import { DeepPartial } from "typeorm";
import { sendWelcomeEmail } from "../services/brevo_email";
import { geoblockPaymentMiddleware } from "../utils/geoblock";
var crypto = require("crypto");

export const passwordAuthRouter = express.Router();

passwordAuthRouter.get("/auth-user", (req, res) => {
  if (req.user) {
    res.send({ user: req.user });
  } else {
    res.send(401);
  }
});

passwordAuthRouter.post(
  "/login",
  passport.authenticate("local", {
    failureMessage: true,
  }),
  (req, res) => {
    if (!req.user) {
      return res
        .status(401)
        .send({ status: "error", message: "Invalid credentials" });
    }

    // Send user info in response
    const { id, username, email, isMaster, title, rating, bio } =
      req.user as any;

    res
      .cookie("sessionID", req.sessionID, {
        httpOnly: true,
        sameSite: "lax",
      })
      .send({
        status: "success",
        user: { id, username, email, isMaster, title, rating, bio },
      });
  }
);

passwordAuthRouter.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.clearCookie("sessionID");
      res.json({ message: "Logged out" });
    });
  });
});

passwordAuthRouter.post("/signup", geoblockPaymentMiddleware, async function (req, res, next) {
  var salt = crypto.randomBytes(16);
  crypto.pbkdf2(
    req.body.password,
    salt,
    310000,
    32,
    "sha256",
    async function (err: any, hashedPassword: DeepPartial<Buffer>) {
      if (err) {
        return next(err);
      }
      try {
        const user = await AppDataSource.getRepository(User).save({
          username: req.body.username,
          email: req.body.username,
          password: hashedPassword,
          salt,
        });
        await sendWelcomeEmail({ toEmail: user.email, toName: user.username });
        res.send({ status: "success" });
      } catch (err) {
        res.redirect("/");
      }
    }
  );
});
