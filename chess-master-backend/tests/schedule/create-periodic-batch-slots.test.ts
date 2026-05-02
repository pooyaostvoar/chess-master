import { AppDataSource } from "../../src/database/datasource";
import { ScheduleSlot } from "../../src/database/entity/schedule-slots";
import { PeriodicSlotConfig } from "../../src/database/entity/periodic-slot-config";
import { User } from "../../src/database/entity/user";
import { authAgent, unauthAgent } from "../setup";

describe("POST /schedule/slot/create-periodic-batch-slots", () => {
  it("creates slots in chunks with defaults and saves all in DB", async () => {
    const response = await authAgent
      .post("/schedule/slot/create-periodic-batch-slots")
      .send({
        interval: {
          start: "2026-05-10T10:00:00.000Z",
          end: "2026-05-10T12:30:00.000Z",
        },
        period: "daily",
        repeatCount: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    // 2.5h range split by default 60m => 3 slots per day, repeated twice
    expect(response.body.createdSlots).toBe(6);
    expect(Array.isArray(response.body.slots)).toBe(true);
    expect(response.body.slots).toHaveLength(6);
    expect(response.body.periodicSlotConfig).toMatchObject({
      chunkSizeMinutes: 60,
      period: "daily",
      repeatCount: 2,
    });
    expect(typeof response.body.periodicSlotConfig?.id).toBe("number");

    const userRepo = AppDataSource.getRepository(User);
    const seedUser = await userRepo.findOneBy({ username: "seeduser" });
    expect(seedUser).toBeDefined();

    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const savedSlots = await slotRepo.find({
      where: { master: { id: seedUser!.id } },
      relations: ["periodicSlotConfig"],
      order: { startTime: "ASC" },
    });

    expect(savedSlots).toHaveLength(6);
    expect(savedSlots.map((s) => s.chunkIndex)).toEqual([0, 1, 2, 0, 1, 2]);
    expect(savedSlots[0].periodicSlotConfig?.id).toBe(
      response.body.periodicSlotConfig.id
    );
    expect(savedSlots[0].startTime.toISOString()).toBe(
      "2026-05-10T10:00:00.000Z"
    );
    expect(savedSlots[0].endTime.toISOString()).toBe(
      "2026-05-10T11:00:00.000Z"
    );
    expect(savedSlots[2].startTime.toISOString()).toBe(
      "2026-05-10T12:00:00.000Z"
    );
    expect(savedSlots[2].endTime.toISOString()).toBe(
      "2026-05-10T12:30:00.000Z"
    );
    expect(savedSlots[3].startTime.toISOString()).toBe(
      "2026-05-11T10:00:00.000Z"
    );
    expect(savedSlots[5].endTime.toISOString()).toBe(
      "2026-05-11T12:30:00.000Z"
    );

    const durationsMinutes = savedSlots.map(
      (slot) =>
        (slot.endTime.getTime() - slot.startTime.getTime()) / (60 * 1000)
    );
    expect(durationsMinutes).toEqual([60, 60, 30, 60, 60, 30]);
  });

  it("creates one slot when interval is under one hour and chunkSizeMinutes is omitted", async () => {
    const response = await authAgent
      .post("/schedule/slot/create-periodic-batch-slots")
      .send({
        interval: {
          start: "2026-05-10T10:00:00.000Z",
          end: "2026-05-10T10:45:00.000Z",
        },
        period: "daily",
        repeatCount: 1,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.createdSlots).toBe(1);
    expect(response.body.slots).toHaveLength(1);

    const userRepo = AppDataSource.getRepository(User);
    const seedUser = await userRepo.findOneBy({ username: "seeduser" });
    expect(seedUser).toBeDefined();

    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const savedSlots = await slotRepo.find({
      where: { master: { id: seedUser!.id } },
      relations: ["periodicSlotConfig"],
      order: { startTime: "ASC" },
    });

    expect(savedSlots).toHaveLength(1);
    expect(savedSlots[0].chunkIndex).toBe(0);
    expect(savedSlots[0].periodicSlotConfig).not.toBeNull();
    expect(savedSlots[0].startTime.toISOString()).toBe(
      "2026-05-10T10:00:00.000Z"
    );
    expect(savedSlots[0].endTime.toISOString()).toBe(
      "2026-05-10T10:45:00.000Z"
    );
  });

  it("creates repeated weekly slots with 7-day shifts", async () => {
    const response = await authAgent
      .post("/schedule/slot/create-periodic-batch-slots")
      .send({
        interval: {
          start: "2026-05-10T10:00:00.000Z",
          end: "2026-05-10T11:30:00.000Z",
        },
        period: "weekly",
        repeatCount: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.createdSlots).toBe(4);
    expect(response.body.slots).toHaveLength(4);

    const userRepo = AppDataSource.getRepository(User);
    const seedUser = await userRepo.findOneBy({ username: "seeduser" });
    expect(seedUser).toBeDefined();

    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const savedSlots = await slotRepo.find({
      where: { master: { id: seedUser!.id } },
      order: { startTime: "ASC" },
    });

    expect(savedSlots).toHaveLength(4);
    expect(savedSlots.map((s) => s.chunkIndex)).toEqual([0, 1, 0, 1]);
    expect(savedSlots[0].startTime.toISOString()).toBe(
      "2026-05-10T10:00:00.000Z"
    );
    expect(savedSlots[1].startTime.toISOString()).toBe(
      "2026-05-10T11:00:00.000Z"
    );
    expect(savedSlots[2].startTime.toISOString()).toBe(
      "2026-05-17T10:00:00.000Z"
    );
    expect(savedSlots[3].startTime.toISOString()).toBe(
      "2026-05-17T11:00:00.000Z"
    );
    expect(savedSlots[3].endTime.toISOString()).toBe(
      "2026-05-17T11:30:00.000Z"
    );
  });

  it("creates repeated monthly slots with month-based shifts", async () => {
    const response = await authAgent
      .post("/schedule/slot/create-periodic-batch-slots")
      .send({
        interval: {
          start: "2026-01-10T09:00:00.000Z",
          end: "2026-01-10T10:30:00.000Z",
        },
        period: "monthly",
        repeatCount: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.createdSlots).toBe(4);
    expect(response.body.slots).toHaveLength(4);

    const userRepo = AppDataSource.getRepository(User);
    const seedUser = await userRepo.findOneBy({ username: "seeduser" });
    expect(seedUser).toBeDefined();

    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const savedSlots = await slotRepo.find({
      where: { master: { id: seedUser!.id } },
      order: { startTime: "ASC" },
    });

    expect(savedSlots).toHaveLength(4);
    expect(savedSlots.map((s) => s.chunkIndex)).toEqual([0, 1, 0, 1]);
    expect(savedSlots[0].startTime.toISOString()).toBe(
      "2026-01-10T09:00:00.000Z"
    );
    expect(savedSlots[1].startTime.toISOString()).toBe(
      "2026-01-10T10:00:00.000Z"
    );
    expect(savedSlots[2].startTime.toISOString()).toBe(
      "2026-02-10T09:00:00.000Z"
    );
    expect(savedSlots[3].startTime.toISOString()).toBe(
      "2026-02-10T10:00:00.000Z"
    );
    expect(savedSlots[3].endTime.toISOString()).toBe(
      "2026-02-10T10:30:00.000Z"
    );
  });

  it("returns 400 for invalid period", async () => {
    const response = await authAgent
      .post("/schedule/slot/create-periodic-batch-slots")
      .send({
        interval: {
          start: "2026-05-10T10:00:00.000Z",
          end: "2026-05-10T11:00:00.000Z",
        },
        period: "yearly",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request body");
  });

  it("returns 400 when interval.start is not before interval.end", async () => {
    const response = await authAgent
      .post("/schedule/slot/create-periodic-batch-slots")
      .send({
        interval: {
          start: "2026-05-10T12:00:00.000Z",
          end: "2026-05-10T10:00:00.000Z",
        },
        period: "daily",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request body");
  });

  it("returns 401 for unauthenticated users", async () => {
    const response = await unauthAgent
      .post("/schedule/slot/create-periodic-batch-slots")
      .send({
        interval: {
          start: "2026-05-10T10:00:00.000Z",
          end: "2026-05-10T12:00:00.000Z",
        },
        period: "daily",
      });

    expect(response.status).toBe(401);
  });

  it("stores PeriodicSlotConfig in DB matching response and links all slots to it", async () => {
    const response = await authAgent
      .post("/schedule/slot/create-periodic-batch-slots")
      .send({
        interval: {
          start: "2026-06-01T14:00:00.000Z",
          end: "2026-06-01T15:00:00.000Z",
        },
        chunkSizeMinutes: 30,
        period: "monthly",
        repeatCount: 2,
      });

    expect(response.status).toBe(200);
    const apiCfg = response.body.periodicSlotConfig;
    expect(apiCfg).toMatchObject({
      chunkSizeMinutes: 30,
      period: "monthly",
      repeatCount: 2,
    });

    const userRepo = AppDataSource.getRepository(User);
    const seedUser = await userRepo.findOneBy({ username: "seeduser" });
    expect(seedUser).toBeDefined();

    const configRepo = AppDataSource.getRepository(PeriodicSlotConfig);
    const dbCfg = await configRepo.findOne({
      where: { id: apiCfg.id },
      relations: ["user"],
    });
    expect(dbCfg).not.toBeNull();
    expect(dbCfg!.chunkSizeMinutes).toBe(30);
    expect(dbCfg!.period).toBe("monthly");
    expect(dbCfg!.repeatCount).toBe(2);
    expect(dbCfg!.user.id).toBe(seedUser!.id);

    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const slots = await slotRepo.find({
      where: {
        master: { id: seedUser!.id },
        periodicSlotConfig: { id: apiCfg.id },
      },
      relations: ["periodicSlotConfig"],
      order: { startTime: "ASC" },
    });
    // 1h interval / 30m => 2 chunks per repeat; 2 repeats => 4 slots
    expect(slots).toHaveLength(4);
    expect(slots.every((s) => s.periodicSlotConfig?.id === apiCfg.id)).toBe(
      true
    );
    expect(slots.map((s) => s.chunkIndex)).toEqual([0, 1, 0, 1]);
  });

  it("chunkIndex resets each repeat: 4 chunks per day × 2 daily repeats => [0,1,2,3,0,1,2,3]", async () => {
    const response = await authAgent
      .post("/schedule/slot/create-periodic-batch-slots")
      .send({
        interval: {
          start: "2026-07-01T09:00:00.000Z",
          end: "2026-07-01T11:00:00.000Z",
        },
        chunkSizeMinutes: 30,
        period: "daily",
        repeatCount: 2,
      });

    expect(response.status).toBe(200);
    expect(response.body.createdSlots).toBe(8);
    expect(response.body.periodicSlotConfig).toMatchObject({
      chunkSizeMinutes: 30,
      period: "daily",
      repeatCount: 2,
    });

    const userRepo = AppDataSource.getRepository(User);
    const seedUser = await userRepo.findOneBy({ username: "seeduser" });
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const saved = await slotRepo.find({
      where: { master: { id: seedUser!.id } },
      order: { startTime: "ASC" },
    });

    expect(saved.map((s) => s.chunkIndex)).toEqual([0, 1, 2, 3, 0, 1, 2, 3]);
    expect(saved.every((s) => s.chunkIndex !== null)).toBe(true);
  });

  it("chunkIndex is only 0 when one chunk fits the whole interval per repeat", async () => {
    const response = await authAgent
      .post("/schedule/slot/create-periodic-batch-slots")
      .send({
        interval: {
          start: "2026-08-01T16:00:00.000Z",
          end: "2026-08-01T16:40:00.000Z",
        },
        chunkSizeMinutes: 60,
        period: "daily",
        repeatCount: 3,
      });

    expect(response.status).toBe(200);
    expect(response.body.createdSlots).toBe(3);
    expect(response.body.periodicSlotConfig?.repeatCount).toBe(3);

    const userRepo = AppDataSource.getRepository(User);
    const seedUser = await userRepo.findOneBy({ username: "seeduser" });
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const saved = await slotRepo.find({
      where: { master: { id: seedUser!.id } },
      order: { startTime: "ASC" },
    });

    expect(saved.map((s) => s.chunkIndex)).toEqual([0, 0, 0]);
  });
});
