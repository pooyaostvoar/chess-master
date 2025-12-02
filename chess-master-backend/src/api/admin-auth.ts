import express from "express";
import crypto from "crypto";
import { passport, isAdmin } from "../middleware/passport";
import { AppDataSource } from "../database/datasource";
import { AdminUser } from "../database/entity/admin-user";
import { DeepPartial } from "typeorm";

export const adminAuthRouter = express.Router();

adminAuthRouter.get("/auth/me", isAdmin, (req, res) => {
  const admin = req.user as AdminUser;
  res.send({
    id: admin.id,
    username: admin.username,
    email: admin.email,
    status: admin.status,
  });
});

adminAuthRouter.post(
  "/auth/login",
  passport.authenticate("admin-local", { failureMessage: true }),
  (req, res) => {
    if (!req.user) {
      return res
        .status(401)
        .send({ status: "error", message: "Invalid credentials" });
    }

    const admin = req.user as AdminUser;
    res
      .cookie("sessionID", req.sessionID, {
        httpOnly: true,
        sameSite: "lax",
      })
      .send({
        status: "success",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          status: admin.status,
        },
      });
  }
);

adminAuthRouter.post("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.clearCookie("sessionID");
      res.json({ message: "Logged out" });
    });
  });
});
