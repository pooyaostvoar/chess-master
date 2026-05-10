import Stripe from "stripe";
import * as paymentService from "../../src/services/payment";
import * as stripeModule from "../../src/services/stripe";
import { AppDataSource } from "../../src/database/datasource";
import { Payment, PaymentStatus } from "../../src/database/entity/payment";
import { ScheduleSlot } from "../../src/database/entity/schedule-slots";
import { User } from "../../src/database/entity/user";
import { SlotStatus } from "../../src/database/entity/types";
import { unauthAgent } from "../setup";

function mockStripeEvent(type: string, dataObject: unknown): Stripe.Event {
  return {
    id: "evt_test_webhook",
    object: "event",
    api_version: "2024-06-20",
    created: Math.floor(Date.now() / 1000),
    type,
    data: { object: dataObject as Stripe.PaymentIntent },
    livemode: false,
    pending_webhooks: 0,
    request: null,
  } as Stripe.Event;
}

async function seedPaymentWithSlot(options?: {
  payment?: Partial<Payment>;
  slot?: Partial<ScheduleSlot>;
}) {
  const slotRepo = AppDataSource.getRepository(ScheduleSlot);
  const paymentRepo = AppDataSource.getRepository(Payment);

  const slot = await slotRepo.save(
    slotRepo.create({
      master: { id: 1 } as User,
      startTime: new Date(Date.now() + 3_600_000),
      endTime: new Date(Date.now() + 7_200_000),
      status: SlotStatus.Reserved,
      title: "Test lesson",
      price: 50,
      reservedById: 1,
      ...options?.slot,
    })
  );

  const payment = await paymentRepo.save(
    paymentRepo.create({
      slot,
      user: { id: 1 } as User,
      amountCents: 5000,
      currency: "usd",
      stripeSessionId: "cs_test_webhook",
      status: PaymentStatus.Pending,
      ...options?.payment,
    })
  );

  const full = await paymentRepo.findOne({
    where: { id: payment.id },
    relations: { slot: { master: true } },
  });
  if (!full) {
    throw new Error("seed payment missing");
  }
  return { payment: full, slot };
}

describe("POST /payments/webhook", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function postWebhook(body = "{}") {
    return unauthAgent
      .post("/payments/webhook")
      .set("Content-Type", "application/json")
      .set("Stripe-Signature", "t=123,v1=fake")
      .send(Buffer.from(body));
  }

  it("returns 400 when webhook signature verification fails", async () => {
    jest
      .spyOn(paymentService, "constructWebhookEvent")
      .mockImplementation(() => {
        throw new Error("Invalid signature");
      });

    const res = await postWebhook("{}");
    expect(res.status).toBe(400);
    expect(res.text).toBe("Webhook error");
  });

  it("acknowledges events without paymentId metadata without updating DB", async () => {
    const intent = {
      id: "pi_no_meta",
      metadata: {},
    };
    jest
      .spyOn(paymentService, "constructWebhookEvent")
      .mockReturnValue(
        mockStripeEvent("payment_intent.succeeded", intent) as Stripe.Event
      );

    const { payment } = await seedPaymentWithSlot();
    const res = await postWebhook("{}");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });

    const fresh = await AppDataSource.getRepository(Payment).findOneBy({
      id: payment.id,
    });
    expect(fresh?.status).toBe(PaymentStatus.Pending);
  });

  it("acknowledges when payment row is missing", async () => {
    const intent = {
      id: "pi_missing",
      metadata: { paymentId: "999999" },
    };
    jest
      .spyOn(paymentService, "constructWebhookEvent")
      .mockReturnValue(
        mockStripeEvent("payment_intent.succeeded", intent) as Stripe.Event
      );

    const res = await postWebhook("{}");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
  });

  it("marks payment succeeded on payment_intent.succeeded", async () => {
    const { payment } = await seedPaymentWithSlot();
    const intent = {
      id: "pi_succeeded",
      metadata: { paymentId: String(payment.id) },
    };
    jest
      .spyOn(paymentService, "constructWebhookEvent")
      .mockReturnValue(
        mockStripeEvent("payment_intent.succeeded", intent) as Stripe.Event
      );

    const res = await postWebhook("{}");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });

    const updated = await AppDataSource.getRepository(Payment).findOneBy({
      id: payment.id,
    });
    expect(updated?.status).toBe(PaymentStatus.Succeeded);
  });

  it("is idempotent for payment_intent.succeeded when already succeeded", async () => {
    const { payment } = await seedPaymentWithSlot({
      payment: { status: PaymentStatus.Succeeded },
    });
    const intent = {
      id: "pi_succeeded",
      metadata: { paymentId: String(payment.id) },
    };
    jest
      .spyOn(paymentService, "constructWebhookEvent")
      .mockReturnValue(
        mockStripeEvent("payment_intent.succeeded", intent) as Stripe.Event
      );

    const res = await postWebhook("{}");
    expect(res.status).toBe(200);

    const rows = await AppDataSource.getRepository(Payment).find({
      where: { id: payment.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe(PaymentStatus.Succeeded);
  });

  it("sets reserved state and slot paid on payment_intent.amount_capturable_updated", async () => {
    jest.spyOn(stripeModule, "getStripeInstance").mockReturnValue({
      paymentIntents: {
        cancel: jest.fn().mockResolvedValue({ id: "pi_cancel" }),
      },
    } as any);

    const { payment, slot } = await seedPaymentWithSlot();
    const intent = {
      id: "pi_capturable",
      metadata: { paymentId: String(payment.id) },
    };
    jest
      .spyOn(paymentService, "constructWebhookEvent")
      .mockReturnValue(
        mockStripeEvent(
          "payment_intent.amount_capturable_updated",
          intent
        ) as Stripe.Event
      );

    const res = await postWebhook("{}");
    expect(res.status).toBe(200);

    const paymentRepo = AppDataSource.getRepository(Payment);
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);

    const updatedPayment = await paymentRepo.findOneBy({ id: payment.id });
    expect(updatedPayment?.status).toBe(PaymentStatus.Reserved);
    expect(updatedPayment?.stripePaymentIntentId).toBe("pi_capturable");

    const updatedSlot = await slotRepo.findOneBy({ id: slot.id });
    expect(updatedSlot?.status).toBe(SlotStatus.Paid);
  });

  it("is idempotent for amount_capturable_updated when already reserved", async () => {
    const { payment } = await seedPaymentWithSlot({
      payment: {
        status: PaymentStatus.Reserved,
        stripePaymentIntentId: "pi_existing",
      },
    });
    const intent = {
      id: "pi_capturable",
      metadata: { paymentId: String(payment.id) },
    };
    jest
      .spyOn(paymentService, "constructWebhookEvent")
      .mockReturnValue(
        mockStripeEvent(
          "payment_intent.amount_capturable_updated",
          intent
        ) as Stripe.Event
      );

    const res = await postWebhook("{}");
    expect(res.status).toBe(200);

    const updated = await AppDataSource.getRepository(Payment).findOneBy({
      id: payment.id,
    });
    expect(updated?.stripePaymentIntentId).toBe("pi_existing");
  });

  it("marks payment failed and frees slot on payment_intent.payment_failed", async () => {
    const { payment, slot } = await seedPaymentWithSlot();
    const intent = {
      id: "pi_failed",
      metadata: { paymentId: String(payment.id) },
    };
    jest
      .spyOn(paymentService, "constructWebhookEvent")
      .mockReturnValue(
        mockStripeEvent("payment_intent.payment_failed", intent) as Stripe.Event
      );

    const res = await postWebhook("{}");
    expect(res.status).toBe(200);

    const paymentRepo = AppDataSource.getRepository(Payment);
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);

    expect((await paymentRepo.findOneBy({ id: payment.id }))?.status).toBe(
      PaymentStatus.Failed
    );
    expect((await slotRepo.findOneBy({ id: slot.id }))?.status).toBe(
      SlotStatus.Free
    );
  });

  it("marks payment refunded and frees slot on charge.refunded", async () => {
    const { payment, slot } = await seedPaymentWithSlot({
      payment: {
        status: PaymentStatus.Reserved,
        stripePaymentIntentId: "pi_reserved",
      },
      slot: { status: SlotStatus.Paid },
    });

    const charge = {
      id: "ch_refund",
      metadata: { paymentId: String(payment.id) },
    };
    jest.spyOn(paymentService, "constructWebhookEvent").mockReturnValue({
      id: "evt_refund",
      object: "event",
      type: "charge.refunded",
      data: { object: charge },
    } as Stripe.Event);

    const res = await postWebhook("{}");
    expect(res.status).toBe(200);

    const paymentRepo = AppDataSource.getRepository(Payment);
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);

    expect((await paymentRepo.findOneBy({ id: payment.id }))?.status).toBe(
      PaymentStatus.Refunded
    );
    expect((await slotRepo.findOneBy({ id: slot.id }))?.status).toBe(
      SlotStatus.Free
    );
  });

  it("acknowledges unhandled event types without changing payment", async () => {
    const { payment } = await seedPaymentWithSlot();
    const intent = {
      id: "pi_other",
      metadata: { paymentId: String(payment.id) },
    };
    jest
      .spyOn(paymentService, "constructWebhookEvent")
      .mockReturnValue(
        mockStripeEvent("customer.created", intent) as Stripe.Event
      );

    const res = await postWebhook("{}");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });

    const fresh = await AppDataSource.getRepository(Payment).findOneBy({
      id: payment.id,
    });
    expect(fresh?.status).toBe(PaymentStatus.Pending);
  });
});
