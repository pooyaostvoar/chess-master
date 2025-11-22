import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";
import { Request, Response, NextFunction } from "express";

export const passport = require("passport");
var LocalStrategy = require("passport-local");
var crypto = require("crypto");

passport.use(
  new LocalStrategy(async function verify(
    username: string,
    password: string,
    cb: any
  ) {
    let user: any;
    try {
      user = await AppDataSource.getRepository(User).findOne({
        where: { username },
      });
      if (!user) {
        return cb(null, false, {
          message: "Incorrect username or password.",
        });
      }
    } catch (err) {
      cb(err);
    }

    crypto.pbkdf2(
      password,
      user.salt,
      310000,
      32,
      "sha256",
      function (err: any, hashedPassword: string) {
        if (err) {
          return cb(err);
        }
        if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }
        return cb(null, user);
      }
    );
  })
);

passport.serializeUser(function (user: User, cb: any) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user: User, cb: any) {
  process.nextTick(function () {
    console.log("deserializeUser", user);
    return cb(null, user);
  });
});

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ error: "Unauthorized" });
};
