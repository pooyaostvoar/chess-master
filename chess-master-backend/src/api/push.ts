// api/push.ts
import { Router } from "express";
import { AppDataSource } from "../database/datasource";
import { PushSubscription } from "../database/entity/push-subscription";
import { isAuthenticated } from "../middleware/passport";

const pushRouter = Router();

pushRouter.post("/subscribe", isAuthenticated, async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(PushSubscription);

    const userId = (req.user as any).id;
    if (!userId) return res.status(401).send("Not authenticated");

    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).send("Invalid subscription object");
    }

    try {
      const sub = repo.create({
        userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });
      await repo.save(sub);
    } catch (e: any) {
      if (e.code === "23505") {
        console.log(`Subscription already exists for endpoint ${endpoint}`);
      } else {
        throw e;
      }
    }

    res.sendStatus(201);
  } catch (err) {
    console.error("Error storing subscription:", err);
    res.status(500).send("Server error");
  }
});

export default pushRouter;
