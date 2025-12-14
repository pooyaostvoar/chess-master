import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";
import { AdminUser } from "../database/entity/admin-user";
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

passport.use(
  "admin-local",
  new LocalStrategy(async function verify(
    username: string,
    password: string,
    cb: any
  ) {
    let admin: any;
    try {
      admin = await AppDataSource.getRepository(AdminUser).findOne({
        where: { username },
      });
      if (
        !admin ||
        admin.status !== "active" ||
        !admin.password ||
        !admin.salt ||
        !Buffer.isBuffer(admin.password) ||
        !Buffer.isBuffer(admin.salt)
      ) {
        return cb(null, false, {
          message: "Incorrect username or password.",
        });
      }
    } catch (err) {
      return cb(err);
    }

    crypto.pbkdf2(
      password,
      admin.salt,
      310000,
      32,
      "sha256",
      function (err: any, hashedPassword: Buffer) {
        if (err) {
          return cb(err);
        }
        const stored = admin.password;
        // Ensure same length before timingSafeEqual to avoid runtime errors.
        if (
          !stored ||
          !Buffer.isBuffer(stored) ||
          stored.length !== hashedPassword.length
        ) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }
        if (!crypto.timingSafeEqual(stored, hashedPassword)) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }
        return cb(null, admin);
      }
    );
  })
);

passport.serializeUser(function (user: User | AdminUser, cb: any) {
  process.nextTick(function () {
    const kind = user instanceof AdminUser ? "admin" : "user";
    cb(null, { id: user.id, username: user.username, kind });
  });
});

passport.deserializeUser(async function (user: any, cb: any) {
  try {
    if (user.kind === "admin") {
      const admin = await AppDataSource.getRepository(AdminUser).findOne({
        where: { id: user.id },
      });
      return cb(null, admin || false);
    }

    const normalUser = await AppDataSource.getRepository(User).findOne({
      where: { id: user.id },
    });
    return cb(null, normalUser || false);
  } catch (err) {
    return cb(err);
  }
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

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user: any = req.user;
    if (user && user instanceof AdminUser) {
      return next();
    }
  }
  res.status(403).json({ error: "Forbidden" });
};
