import { Router } from "express";
import { constructWebhookEvent } from "../../services/payment";
import { AppDataSource } from "../../database/datasource";

import { Payment, PaymentStatus } from "../../database/entity/payment";
import { SlotStatus } from "../../database/entity/types";

import { updateSlotStatus } from "../../services/schedule.service";
import Stripe from "stripe";
import { ScheduleSlot } from "../../database/entity/schedule-slots";
import { logRequestError } from "../../utils/log-request-error";

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
        logRequestError(req, null, "Payment not found for webhook", {
          paymentId,
          eventType: event.type,
        });
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
          logRequestError(req, err, "Webhook amount_capturable_updated error", {
            paymentId,
            eventType: event.type,
          });
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
          logRequestError(req, err, "Webhook payment_intent.succeeded error", {
            paymentId,
            eventType: event.type,
          });
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
          logRequestError(req, err, "Webhook payment_intent.payment_failed error", {
            paymentId,
            eventType: event.type,
          });
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
            // Free the slot while payment is still "reserved" so updateSlotStatus
            // can resolve stripePaymentIntentId for cancellation.

            const repo = trx.getRepository(Payment);
            payment.status = PaymentStatus.Refunded;
            await repo.save(payment);
            const slot = payment.slot;
            slot.status = SlotStatus.Free;
            await trx.getRepository(ScheduleSlot).save(slot);
          });

          return res.json({ received: true });
        } catch (err) {
          logRequestError(req, err, "Webhook charge.refunded error", {
            paymentId,
            eventType: event.type,
          });
          return res.status(500).send("Webhook processing failed");
        }
      }

      res.json({ received: true });
    } catch (err) {
      logRequestError(req, err, "Webhook processing error");
      res.status(400).send("Webhook error");
    }
  }
);
