import express from "express";
import { AppDataSource } from "../database/datasource";
import { User } from "../database/entity/user";
import { isAdmin } from "../middleware/passport";

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
    const user = await repo.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(trimUser(user));
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
  };
}
