import { Router } from "express";
import { AppDataSource } from "../../database/datasource";
import { User } from "../../database/entity/user";

export const router = Router();

router.get("", async (req, res) => {
  try {
    const { username, email, title, isMaster, minRating, maxRating } =
      req.query;

    const repo = AppDataSource.getRepository(User);
    let qb = repo.createQueryBuilder("user");

    // username (LIKE %username%)
    if (username) {
      qb = qb.andWhere("user.username ILIKE :username", {
        username: `%${username}%`,
      });
    }

    // email (LIKE %email%)
    if (email) {
      qb = qb.andWhere("user.email ILIKE :email", {
        email: `%${email}%`,
      });
    }

    // title (exact)
    if (title) {
      qb = qb.andWhere("user.title = :title", { title });
    }

    // isMaster (boolean)
    if (isMaster !== undefined) {
      qb = qb.andWhere("user.isMaster = :isMaster", {
        isMaster: isMaster === "true",
      });
    }

    // rating between min/max
    if (minRating) {
      qb = qb.andWhere("user.rating >= :minRating", {
        minRating: parseInt(minRating as string, 10),
      });
    }

    if (maxRating) {
      qb = qb.andWhere("user.rating <= :maxRating", {
        maxRating: parseInt(maxRating as string, 10),
      });
    }

    const users = await qb.getMany();

    res.json({ status: "success", users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
