import { Router } from "express";
import { constructWebhookEvent } from "../../services/payment";
import { AppDataSource } from "../../database/datasource";
import { ScheduleSlot } from "../../database/entity/schedule-slots";
import { Payment, PaymentStatus } from "../../database/entity/payment";
import { SlotStatus } from "../../database/entity/types";
import { sendNotificationToTelegram } from "../../services/notification.service";

export const router = Router();

router.post(
  "",
  require("express").raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"] as string;

      const event = constructWebhookEvent(req.body, sig);

      const paymentRepo = AppDataSource.getRepository(Payment);
      const slotRepo = AppDataSource.getRepository(ScheduleSlot);

      // =========================================
      // CHECKOUT COMPLETED
      // =========================================
      if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;

        const paymentId = Number(session.metadata.paymentId);

        const payment = await paymentRepo.findOne({
          where: { id: paymentId },
          relations: { slot: { master: true }, user: true },
        });

        if (!payment) {
          console.error("Payment not found:", paymentId);
          return res.status(400).send("Payment not found");
        }

        // ✅ Idempotent (Stripe retries safe)
        if (payment.status === PaymentStatus.Succeeded) {
          console.log("Already processed, skipping");
          return res.json({ received: true });
        }

        // 1️⃣ mark payment succeeded
        payment.status = PaymentStatus.Succeeded;
        payment.stripePaymentIntentId = session.payment_intent;

        await paymentRepo.save(payment);

        // 2️⃣ change slot status to PAID
        const slot = payment.slot;

        slot.status = SlotStatus.Paid;
        slot.reservedBy = payment.user;

        await slotRepo.save(slot);
        await sendNotificationToTelegram({
          master: slot.master.email ?? "",
          reservedBy: payment.user.email ?? "",
        });
      }

      // =========================================
      // PAYMENT FAILED (optional but recommended)
      // =========================================
      if (event.type === "payment_intent.payment_failed") {
        const intent = event.data.object as any;

        const payment = await paymentRepo.findOne({
          where: { stripePaymentIntentId: intent.id },
        });

        if (payment) {
          payment.status = PaymentStatus.Failed;
          await paymentRepo.save(payment);
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(400).send("Webhook error");
    }
  }
);
