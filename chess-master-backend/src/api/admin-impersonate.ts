import express from "express";

import { isAdmin } from "../middleware/passport";

import { getUserById } from "../services/user.service";

export const router = express.Router();

router.get("/:userId", isAdmin, async (req, res, next) => {
  const userId = Number(req.params.userId);
  const targetUser = await getUserById(userId);
  if (!targetUser) return res.status(404).send("User not found");

  // save admin identity once
  if (!(req.session as any).impersonator) {
    (req.session as any).impersonator = (req.user as any).id;
  }

  // THIS is the passport way to switch users
  req.login(targetUser, (err) => {
    if (err) return next(err);
    res.send({ success: true });
  });
});
