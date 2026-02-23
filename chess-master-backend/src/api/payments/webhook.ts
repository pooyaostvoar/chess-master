import { Router } from "express";
import { constructWebhookEvent } from "../../services/payment";
import { AppDataSource } from "../../database/datasource";

import { Payment, PaymentStatus } from "../../database/entity/payment";
import { SlotStatus } from "../../database/entity/types";

import { updateSlotStatus } from "../../services/schedule.service";

export const router = Router();

router.post(
  "",
  require("express").raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"] as string;

      const event = constructWebhookEvent(req.body, sig);

      const paymentRepo = AppDataSource.getRepository(Payment);

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

        await updateSlotStatus(slot.id, slot.master.id, SlotStatus.Paid);
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

      if (event.type === "checkout.session.expired") {
        const session = event.data.object as any;

        const paymentId = Number(session.metadata.paymentId);

        const payment = await paymentRepo.findOne({
          where: { id: paymentId },
          relations: { slot: { master: true } },
        });

        if (!payment) {
          return res.json({ received: true });
        }

        // Session expired → slot never paid → safe to release
        payment.status = PaymentStatus.Failed;
        await paymentRepo.save(payment);

        await updateSlotStatus(
          payment.slot.id,
          payment.slot.master.id,
          SlotStatus.Free
        );
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(400).send("Webhook error");
    }
  }
);
