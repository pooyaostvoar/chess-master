import { AppDataSource } from "../../src/database/datasource";
import { ScheduleSlot } from "../../src/database/entity/schedule-slots";
import { User } from "../../src/database/entity/user";
import { SlotStatus } from "../../src/database/entity/types";
import { unauthAgent } from "../setup";

describe("GET /schedule/slot/user/:userId/active", () => {
  const masterId = 1;

  it("should return only future free slots for the master", async () => {
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);

    await slotRepo.save([
      slotRepo.create({
        master: { id: masterId } as User,
        startTime: new Date(Date.now() + 3_600_000),
        endTime: new Date(Date.now() + 7_200_000),
        status: SlotStatus.Free,
        title: "Future free",
        price: 25,
      }),
      slotRepo.create({
        master: { id: masterId } as User,
        startTime: new Date(Date.now() - 3_600_000),
        endTime: new Date(Date.now() - 1_800_000),
        status: SlotStatus.Free,
        title: "Past free",
        price: null,
      }),
      slotRepo.create({
        master: { id: masterId } as User,
        startTime: new Date(Date.now() + 7_200_000),
        endTime: new Date(Date.now() + 10_800_000),
        status: SlotStatus.Reserved,
        title: "Future reserved",
        price: 30,
      }),
    ]);

    const res = await unauthAgent.get(
      `/schedule/slot/user/${masterId}/active`
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.slots).toHaveLength(1);
    expect(res.body.slots[0].title).toBe("Future free");
    expect(res.body.slots[0].status).toBe(SlotStatus.Free);
    expect(res.body.slots[0].price).toBe(25);
    expect(res.body.slots[0].id).toBeDefined();
    expect(res.body.slots[0].startTime).toBeDefined();
    expect(res.body.slots[0].endTime).toBeDefined();
  });

  it("should return slots ordered by startTime ascending", async () => {
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);

    await slotRepo.save([
      slotRepo.create({
        master: { id: masterId } as User,
        startTime: new Date(Date.now() + 10_800_000),
        endTime: new Date(Date.now() + 14_400_000),
        status: SlotStatus.Free,
        title: "Later",
        price: null,
      }),
      slotRepo.create({
        master: { id: masterId } as User,
        startTime: new Date(Date.now() + 3_600_000),
        endTime: new Date(Date.now() + 7_200_000),
        status: SlotStatus.Free,
        title: "Sooner",
        price: null,
      }),
    ]);

    const res = await unauthAgent.get(
      `/schedule/slot/user/${masterId}/active`
    );

    expect(res.status).toBe(200);
    expect(res.body.slots.length).toBe(2);
    expect(res.body.slots[0].title).toBe("Sooner");
    expect(res.body.slots[1].title).toBe("Later");
  });

  it("should return empty slots when none match", async () => {
    const res = await unauthAgent.get("/schedule/slot/user/999/active");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, slots: [] });
  });

  it("should not include another master's slots", async () => {
    await unauthAgent
      .post("/signup")
      .send({ username: "othermaster", password: "mypassword" })
      .expect(200);

    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    await slotRepo.save(
      slotRepo.create({
        master: { id: 2 } as User,
        startTime: new Date(Date.now() + 3_600_000),
        endTime: new Date(Date.now() + 7_200_000),
        status: SlotStatus.Free,
        title: "Other master",
        price: 10,
      })
    );

    const res = await unauthAgent.get("/schedule/slot/user/1/active");

    expect(res.status).toBe(200);
    expect(res.body.slots).toEqual([]);
  });

  it("should return 400 for invalid user id", async () => {
    const res = await unauthAgent.get("/schedule/slot/user/notanumber/active");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid user id" });
  });
});
