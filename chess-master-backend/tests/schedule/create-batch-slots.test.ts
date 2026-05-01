import { AppDataSource } from "../../src/database/datasource";
import { ScheduleSlot } from "../../src/database/entity/schedule-slots";
import { User } from "../../src/database/entity/user";
import { authAgent, unauthAgent } from "../setup";

describe("POST /schedule/slot/create-batch-slots", () => {
  it("creates slots in chunks with defaults and saves all in DB", async () => {
    const response = await authAgent.post("/schedule/slot/create-batch-slots").send({
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

    const userRepo = AppDataSource.getRepository(User);
    const seedUser = await userRepo.findOneBy({ username: "seeduser" });
    expect(seedUser).toBeDefined();

    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const savedSlots = await slotRepo.find({
      where: { master: { id: seedUser!.id } },
      order: { startTime: "ASC" },
    });

    expect(savedSlots).toHaveLength(6);
    expect(savedSlots[0].startTime.toISOString()).toBe("2026-05-10T10:00:00.000Z");
    expect(savedSlots[0].endTime.toISOString()).toBe("2026-05-10T11:00:00.000Z");
    expect(savedSlots[2].startTime.toISOString()).toBe("2026-05-10T12:00:00.000Z");
    expect(savedSlots[2].endTime.toISOString()).toBe("2026-05-10T12:30:00.000Z");
    expect(savedSlots[3].startTime.toISOString()).toBe("2026-05-11T10:00:00.000Z");
    expect(savedSlots[5].endTime.toISOString()).toBe("2026-05-11T12:30:00.000Z");

    const durationsMinutes = savedSlots.map(
      (slot) => (slot.endTime.getTime() - slot.startTime.getTime()) / (60 * 1000)
    );
    expect(durationsMinutes).toEqual([60, 60, 30, 60, 60, 30]);
  });

  it("creates one slot when interval is under one hour and chunkSizeMinutes is omitted", async () => {
    const response = await authAgent.post("/schedule/slot/create-batch-slots").send({
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
      order: { startTime: "ASC" },
    });

    expect(savedSlots).toHaveLength(1);
    expect(savedSlots[0].startTime.toISOString()).toBe("2026-05-10T10:00:00.000Z");
    expect(savedSlots[0].endTime.toISOString()).toBe("2026-05-10T10:45:00.000Z");
  });

  it("creates repeated weekly slots with 7-day shifts", async () => {
    const response = await authAgent.post("/schedule/slot/create-batch-slots").send({
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
    expect(savedSlots[0].startTime.toISOString()).toBe("2026-05-10T10:00:00.000Z");
    expect(savedSlots[1].startTime.toISOString()).toBe("2026-05-10T11:00:00.000Z");
    expect(savedSlots[2].startTime.toISOString()).toBe("2026-05-17T10:00:00.000Z");
    expect(savedSlots[3].startTime.toISOString()).toBe("2026-05-17T11:00:00.000Z");
    expect(savedSlots[3].endTime.toISOString()).toBe("2026-05-17T11:30:00.000Z");
  });

  it("creates repeated monthly slots with month-based shifts", async () => {
    const response = await authAgent.post("/schedule/slot/create-batch-slots").send({
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
    expect(savedSlots[0].startTime.toISOString()).toBe("2026-01-10T09:00:00.000Z");
    expect(savedSlots[1].startTime.toISOString()).toBe("2026-01-10T10:00:00.000Z");
    expect(savedSlots[2].startTime.toISOString()).toBe("2026-02-10T09:00:00.000Z");
    expect(savedSlots[3].startTime.toISOString()).toBe("2026-02-10T10:00:00.000Z");
    expect(savedSlots[3].endTime.toISOString()).toBe("2026-02-10T10:30:00.000Z");
  });

  it("returns 400 for invalid period", async () => {
    const response = await authAgent.post("/schedule/slot/create-batch-slots").send({
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
    const response = await authAgent.post("/schedule/slot/create-batch-slots").send({
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
    const response = await unauthAgent.post("/schedule/slot/create-batch-slots").send({
      interval: {
        start: "2026-05-10T10:00:00.000Z",
        end: "2026-05-10T12:00:00.000Z",
      },
      period: "daily",
    });

    expect(response.status).toBe(401);
  });
});
