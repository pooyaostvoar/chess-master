import express from "express";
import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";
import { isAdmin } from "../middleware/passport";
import { ScheduleSlot } from "../database/entity/schedule-slots";
import { SlotStatus } from "../database/entity/types";

export const adminUsersRouter = express.Router();

adminUsersRouter.use(isAdmin);

adminUsersRouter.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt((req.query.pageSize as string) || "20", 10), 1),
      100
    );
    const q = (req.query.q as string)?.trim();
    const role = (req.query.role as string)?.toLowerCase();

    const repo = AppDataSource.getRepository(User);
    const qb = repo.createQueryBuilder("user");

    if (q) {
      qb.andWhere("(user.username ILIKE :q OR user.email ILIKE :q)", {
        q: `%${q}%`,
      });
    }

    if (role === "master") {
      qb.andWhere("user.isMaster = true");
    } else if (role === "user") {
      qb.andWhere("user.isMaster = false");
    }

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    res.json({
      items: items.map(trimUser),
      total,
      page,
      pageSize,
    });
  } catch (err) {
    next(err);
  }
});

adminUsersRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id }, relations: ["pricing"] });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(trimUser(user));
  } catch (err) {
    next(err);
  }
});

adminUsersRouter.get("/:id/sessions", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt((req.query.pageSize as string) || "10", 10), 1),
      100
    );

    const repo = AppDataSource.getRepository(ScheduleSlot);

    const qb = repo
      .createQueryBuilder("slot")
      .leftJoinAndSelect("slot.master", "master")
      .leftJoinAndSelect("slot.reservedBy", "reservedBy")
      .where("master.id = :id OR reservedBy.id = :id", { id })
      .orderBy("slot.startTime", "DESC")
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    res.json({
      items: items.map((slot) => ({
        id: slot.id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
        master: slot.master ? { id: slot.master.id, username: slot.master.username } : null,
        customer: slot.reservedBy
          ? { id: slot.reservedBy.id, username: slot.reservedBy.username }
          : null,
      })),
      total,
      page,
      pageSize,
    });
  } catch (err) {
    next(err);
  }
});

adminUsersRouter.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      username,
      email,
      isMaster,
      title,
      rating,
      bio,
      profilePicture,
      chesscomUrl,
      lichessUrl,
    } = req.body || {};

    if (username !== undefined) user.username = username;
    if (email !== undefined) user.email = email;
    if (isMaster !== undefined) user.isMaster = Boolean(isMaster);
    if (title !== undefined) user.title = title;
    if (rating !== undefined) user.rating = rating;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (chesscomUrl !== undefined) user.chesscomUrl = chesscomUrl;
    if (lichessUrl !== undefined) user.lichessUrl = lichessUrl;

    const updated = await repo.save(user);
    res.json(trimUser(updated));
  } catch (err) {
    next(err);
  }
});

function trimUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    isMaster: user.isMaster,
    title: user.title,
    rating: user.rating,
    bio: user.bio,
    profilePicture: user.profilePicture,
    chesscomUrl: user.chesscomUrl,
    lichessUrl: user.lichessUrl,
    pricing: user.pricing
      ? {
          price5min: user.pricing.price5min,
          price10min: user.pricing.price10min,
          price15min: user.pricing.price15min,
          price30min: user.pricing.price30min,
          price45min: user.pricing.price45min,
          price60min: user.pricing.price60min,
        }
      : null,
  };
}
