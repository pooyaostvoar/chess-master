import express, { Request, Response } from "express";
import { AppDataSource } from "../database/datasource";
import { passport } from "../middleware/passport";
import { User } from "../database/entity/user";
import { DeepPartial } from "typeorm";
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
    return res.cookie("sessionID", req.sessionID).send({ status: "success" });
  }
);

passwordAuthRouter.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

passwordAuthRouter.post("/signup", async function (req, res, next) {
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
        await AppDataSource.getRepository(User).save({
          username: req.body.username,
          password: hashedPassword,
          salt,
          email: "",
        });
        res.send({ status: "success" });
      } catch (err) {
        res.redirect("/");
      }
    }
  );
});
