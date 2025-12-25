import webpush from "web-push";
import { readSecret } from "../utils/secret";
import { AppDataSource } from "../database/datasource";
import { PushSubscription } from "../database/entity/push-subscription";

if (["development", "production"].includes(process.env.ENV ?? "")) {
  webpush.setVapidDetails(
    "mailto:admin@yourapp.com",
    readSecret("/run/secrets/vapid_public_key") || "public_key_missing",
    readSecret("/run/secrets/vapid_private_key") || "private_key_missing"
  );
}

export function sendPush(subscription: any, payload: any) {
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

export async function sendPushToUser(userId: number, payload: any) {
  const repo = AppDataSource.getRepository(PushSubscription);
  const subscriptions = await repo.find({ where: { userId } });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        const subscriptionForWebPush = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await sendPush(subscriptionForWebPush, payload);
      } catch (err: any) {
        console.error(`Failed to send push to endpoint ${sub.endpoint}:`, err);

        // Remove subscription if expired or gone
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await repo.delete(sub.id);
          console.log(`Removed expired subscription ${sub.endpoint}`);
        }
      }
    })
  );
}
