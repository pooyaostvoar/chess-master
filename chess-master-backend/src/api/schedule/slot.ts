import { Router } from "express";
import { isAuthenticated } from "../../middleware/passport";
import { AppDataSource } from "../../database/datasource";
import { ScheduleSlot } from "../../database/entity/schedule-slots";
import { In } from "typeorm";

export const slotRouter = Router();

slotRouter.post("", isAuthenticated, async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    // if (!req?.user?.isMaster) {
    //   return res.status(403).json({ error: "Only masters can create slots" });
    // }

    const repo = AppDataSource.getRepository(ScheduleSlot);

    const slot = repo.create({
      master: req.user,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });

    await repo.save(slot);

    res.json({ success: true, slot });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

slotRouter.get("/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    const repo = AppDataSource.getRepository(ScheduleSlot);

    const slots = await repo.find({
      where: { master: { id: userId } },
      order: { startTime: "ASC" },
    });

    res.json({ success: true, slots });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

slotRouter.delete("/", isAuthenticated, async (req, res) => {
  try {
    const ids: number[] = req.body.ids;
    const userId = (req.user as any)?.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids must be a non-empty array" });
    }

    const repo = AppDataSource.getRepository(ScheduleSlot);

    // Only delete slots owned by this master
    const slots = await repo.find({
      where: {
        id: In(ids),
        master: { id: userId },
      },
      relations: ["master"],
    });

    if (slots.length === 0) {
      return res.status(404).json({ error: "No valid slots found" });
    }

    await repo.remove(slots);

    return res.json({
      success: true,
      deletedIds: slots.map((s) => s.id),
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});
