import { Router } from "express";
import { constructWebhookEvent } from "../../services/payment";
import { AppDataSource } from "../../database/datasource";

import { Payment, PaymentStatus } from "../../database/entity/payment";
import { SlotStatus } from "../../database/entity/types";

import { updateSlotStatus } from "../../services/schedule.service";
import Stripe from "stripe";
import { ScheduleSlot } from "../../database/entity/schedule-slots";

export const router = Router();

router.post(
  "",
  require("express").raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"] as string;

      const event = constructWebhookEvent(req.body, sig);

      const paymentRepo = AppDataSource.getRepository(Payment);
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session.metadata?.paymentId) {
        return res.json({ received: true });
      }
      const paymentId = Number(session.metadata?.paymentId);

      const payment = await paymentRepo.findOne({
        where: { id: paymentId },
        relations: { slot: { master: true } },
      });

      if (!payment) {
        console.error("Payment not found:", paymentId);
        return res.json({ received: true });
      }

      // =========================================
      // MONEY RESERVED WAITING FOR CAPTURE
      // =========================================
      if (event.type === "payment_intent.amount_capturable_updated") {
        const intent = event.data.object as Stripe.PaymentIntent;

        // idempotency
        if (payment.status === PaymentStatus.Reserved) {
          return res.json({ received: true });
        }

        try {
          await AppDataSource.transaction(async (trx) => {
            const trxPaymentRepo = trx.getRepository(Payment);

            payment.status = PaymentStatus.Reserved;
            payment.stripePaymentIntentId = intent.id;
            await trxPaymentRepo.save(payment);

            await updateSlotStatus(
              payment.slot.id,
              payment.slot.master.id,
              SlotStatus.Paid,
              trx
            );
          });

          return res.json({ received: true });
        } catch (err) {
          console.error("amount_capturable_updated error:", err);
          return res.status(400).send("Webhook processing failed");
        }
      }

      // =========================================
      // MONEY CAPTURED
      // =========================================
      if (event.type === "payment_intent.succeeded") {
        // idempotency
        if (payment.status === PaymentStatus.Succeeded) {
          return res.json({ received: true });
        }

        try {
          await AppDataSource.transaction(async (trx) => {
            payment.status = PaymentStatus.Succeeded;

            await paymentRepo.save(payment);
          });

          return res.json({ received: true });
        } catch (err) {
          console.error("payment_intent.succeeded error:", err);
          return res.status(500).send("Webhook processing failed");
        }
      }

      // =========================================
      // PAYMENT FAILED
      // =========================================
      if (
        event.type === "payment_intent.payment_failed" ||
        event.type === "payment_intent.canceled" ||
        event.type === "checkout.session.expired"
      ) {
        // idempotency
        if (payment.status === PaymentStatus.Failed) {
          return res.json({ received: true });
        }

        try {
          await AppDataSource.transaction(async (trx) => {
            const repo = trx.getRepository(Payment);

            payment.status = PaymentStatus.Failed;

            await repo.save(payment);
            const slot = payment.slot;
            slot.status = SlotStatus.Free;
            await trx.getRepository(ScheduleSlot).save(slot);
          });

          return res.json({ received: true });
        } catch (err) {
          console.error("payment_intent.payment_failed error:", err);
          return res.status(500).send("Webhook processing failed");
        }
      }

      // =========================================
      // REFUNDED
      // =========================================
      if (event.type === "charge.refunded") {
        // idempotency
        if (payment.status === PaymentStatus.Refunded) {
          return res.json({ received: true });
        }

        try {
          await AppDataSource.transaction(async (trx) => {
            const repo = trx.getRepository(Payment);

            payment.status = PaymentStatus.Refunded;

            await repo.save(payment);

            // business decision: usually free slot again
            await updateSlotStatus(
              payment.slot.id,
              payment.slot.master.id,
              SlotStatus.Free,
              trx
            );
          });

          return res.json({ received: true });
        } catch (err) {
          console.error("charge.refunded error:", err);
          return res.status(500).send("Webhook processing failed");
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(400).send("Webhook error");
    }
  }
);
