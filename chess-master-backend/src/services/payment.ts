import { AppDataSource } from "../database/datasource";
import { ScheduleSlot } from "../database/entity/schedule-slots";
import { Payment, PaymentStatus } from "../database/entity/payment";
import { User } from "../database/entity/user";
import { SlotStatus } from "../database/entity/types";
import { readSecret } from "../utils/secret";
import { getStripeInstance } from "./stripe";

export function createCheckoutSession(eventId: number, userId: number) {
  const stripe = getStripeInstance();

  return AppDataSource.transaction(async (manager) => {
    const slotRepo = manager.getRepository(ScheduleSlot);
    const paymentRepo = manager.getRepository(Payment);

    // =============================
    // 1. Reserve slot
    // =============================
    const updateResult = await slotRepo.update(
      { id: eventId, status: SlotStatus.Free },
      { status: SlotStatus.Reserved, reservedById: userId }
    );

    if (updateResult.affected === 0) {
      throw new Error("Slot not available");
    }

    // =============================
    // 2. Load slot
    // =============================
    const slot = await slotRepo.findOne({
      where: { id: eventId },
      relations: ["master"],
    });

    if (!slot) {
      throw new Error("Slot not found");
    }

    if (slot.priceCents === 0) {
      return { url: `${getClientUrl()}/home` };
    }

    if (!slot.priceCents) {
      throw new Error("Slot has no price");
    }

    const title = slot.title ?? `Coaching session with ${slot.master.username}`;

    // =============================
    // 3. Create Payment (PENDING)
    // =============================
    const payment = paymentRepo.create({
      slot,
      user: { id: userId } as User,
      amountCents: slot.priceCents,
      currency: "usd",
      stripeSessionId: null, // filled after Stripe call
      status: PaymentStatus.Pending,
    });

    await paymentRepo.save(payment);

    // =============================
    // 4. Create Stripe session
    // =============================

    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: slot.priceCents,
            product_data: {
              name: title,
              description: slot.description ?? undefined,
            },
          },
          quantity: 1,
        },
      ],

      success_url: `${getClientUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getClientUrl()}/cancel`,

      metadata: {
        eventId: eventId.toString(),
        userId: userId.toString(),
        paymentId: payment.id.toString(),
      },
    });

    // =============================
    // 5. Save Stripe session id
    // =============================
    payment.stripeSessionId = session.id;
    await paymentRepo.save(payment);

    return session;
  });
}
export function constructWebhookEvent(body: Buffer, sig: string) {
  const stripe = getStripeInstance();
  return stripe.webhooks.constructEvent(body, sig, getWebhookSecret());
}

let webhookSecret: string | undefined = undefined;
function getWebhookSecret() {
  if (!webhookSecret) {
    webhookSecret =
      process.env.ENV === "production"
        ? readSecret("/run/secrets/stripe_webhook_secret")
        : readSecret("/run/secrets/stripe_webhook_secret_dev") ?? "";
  }
  console.log(webhookSecret, "webhookSecret");
  return webhookSecret as string;
}

function getClientUrl() {
  return process.env.ENV === "production"
    ? "https://chesswithmasters.com"
    : "http://localhost:3000";
}
