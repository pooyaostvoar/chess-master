import { AppDataSource } from "../../src/database/datasource";
import { ScheduleSlot } from "../../src/database/entity/schedule-slots";
import { SlotStatus } from "../../src/database/entity/types";
import { getStripeInstance } from "../../src/services/payment";
import { authAgent } from "../setup";

describe("POST /payments/checkout-session", () => {
  let slot: ScheduleSlot;
  beforeEach(async () => {
    const stripe = getStripeInstance();
    stripe.checkout.sessions.create = jest.fn().mockResolvedValue({
      id: "cs_test_123",
      url: "https://stripe.test/checkout/cs_test_123",
    }) as any;
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    slot = await slotRepo.save({
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      status: SlotStatus.Free,
      priceCents: 5000,
      title: "Test coaching",
    } as any);
  });
  it("should create checkout session and return url", async () => {
    const res = await authAgent
      .post("/payments/checkout-session")
      .send({ eventId: slot.id });

    expect(res.status).toBe(200);
  });

  it("should reserve the slot in DB", async () => {
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    await authAgent
      .post("/payments/checkout-session")
      .send({ eventId: slot.id });

    const updated = await slotRepo.findOneBy({ id: slot.id });

    expect(updated?.status).toBe(SlotStatus.Reserved);
    expect(updated?.reservedById).toBeDefined();
  });

  it("should fail if slot already reserved", async () => {
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    await slotRepo.update({ id: slot.id }, { status: SlotStatus.Reserved });

    const res = await authAgent
      .post("/payments/checkout-session")
      .send({ eventId: slot.id });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/not available/i);
  });

  it("should fail if slot does not exist", async () => {
    const res = await authAgent
      .post("/payments/checkout-session")
      .send({ eventId: 999999 });

    expect(res.status).toBe(400);
  });

  it("should fail if slot has no price", async () => {
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const noPriceSlot = await slotRepo.save({
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
      status: SlotStatus.Free,
      priceCents: null,
    } as any);

    const res = await authAgent
      .post("/payments/checkout-session")
      .send({ eventId: noPriceSlot.id });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/price/i);
  });

  it("should allow only one reservation when called twice concurrently", async () => {
    const [r1, r2] = await Promise.allSettled([
      authAgent.post("/payments/checkout-session").send({ eventId: slot.id }),
      authAgent.post("/payments/checkout-session").send({ eventId: slot.id }),
    ]);

    const successCount = [r1, r2].filter(
      (r: any) => r.value?.status === 200
    ).length;

    expect(successCount).toBe(1);
  });

  it("should rollback reservation if Stripe session creation fails", async () => {
    /**
     * Override Stripe mock to throw
     */
    jest.clearAllMocks();
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const stripe = getStripeInstance();
    stripe.checkout.sessions.create = jest
      .fn()
      .mockRejectedValue(new Error("Stripe failed"));

    const res = await authAgent
      .post("/payments/checkout-session")
      .send({ eventId: slot.id });

    // request should fail
    expect(res.status).toBe(400);

    // 🔥 CRITICAL ASSERTIONS

    // slot should still be FREE (rolled back)
    const freshSlot = await slotRepo.findOneBy({ id: slot.id });
    expect(freshSlot?.status).toBe(SlotStatus.Free);
    expect(freshSlot?.reservedById).toBeNull();
  });
});
