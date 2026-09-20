import { Router } from "express";

import { AppDataSource } from "../../database/datasource";
import { ScheduleSlot } from "../../database/entity/schedule-slots";
import { SlotStatus } from "../../database/entity/types";
import {
  upcomingEventSchema,
  upcomingEventsQuerySchema,
  type UpcomingEventsQuery,
} from "@chess-master/schemas";
import { parseRequest } from "../../middleware/parse-request";
import { logRequestError } from "../../utils/log-request-error";

export const router = Router();

router.get(
  "",
  parseRequest({
    queryParser: upcomingEventsQuerySchema,
  }),
  async (req, res) => {
    try {
      const { from, to, limit } = req.query as unknown as UpcomingEventsQuery;
      const repo = AppDataSource.getRepository(ScheduleSlot);

      const qb = repo
        .createQueryBuilder("slot")
        .leftJoin("slot.master", "master")
        .addSelect([
          "master.id",
          "master.username",
          "master.title",
          "master.profilePictureThumbnailUrl",
          "master.languages",
        ])
        .where("slot.status = :status", { status: SlotStatus.Free })
        .andWhere("slot.startTime > :now", { now: new Date() })
        .orderBy("slot.startTime", "ASC");

      if (from) {
        qb.andWhere("slot.startTime >= :from", { from });
      }
      if (to) {
        qb.andWhere("slot.startTime < :to", { to });
      }

      if (limit) {
        qb.take(limit);
      }

      const events = await qb.getMany();
      res.json({
        succsess: true,
        events: events.map((event) => upcomingEventSchema.parse(event)),
      });
    } catch (err) {
      logRequestError(req, err, "Error fetching upcoming events");
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
