import { AppDataSource } from "../../src/database/datasource";
import { ScheduleSlot } from "../../src/database/entity/schedule-slots";
import { User } from "../../src/database/entity/user";
import { authAgent, unauthAgent } from "../setup";

describe("POST /schedule/slot/delete-batch", () => {
  it("deletes all slots with the same periodicSlotConfig and chunkIndex", async () => {
    await authAgent.post("/schedule/slot/create-batch-slots").send({
      interval: {
        start: "2026-09-01T10:00:00.000Z",
        end: "2026-09-01T10:45:00.000Z",
      },
      period: "daily",
      repeatCount: 3,
    });

    const userRepo = AppDataSource.getRepository(User);
    const seedUser = await userRepo.findOneBy({ username: "seeduser" });
    expect(seedUser).toBeDefined();

    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    const before = await slotRepo.find({
      where: { master: { id: seedUser!.id } },
      order: { startTime: "ASC" },
    });
    expect(before).toHaveLength(3);
    expect(before.every((s) => s.chunkIndex === 0)).toBe(true);

    const targetId = before[1].id;
    const res = await authAgent.post("/schedule/slot/delete-batch").send({
      slotId: targetId,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.deletedCount).toBe(3);
    expect(res.body.deletedIds).toHaveLength(3);
    expect(res.body.deletedIds.sort()).toEqual(
      before.map((s) => s.id).sort()
    );

    const after = await slotRepo.find({
      where: { master: { id: seedUser!.id } },
    });
    expect(after).toHaveLength(0);
  });

  it("deletes only the slot when it has no periodic config", async () => {
    const createRes = await authAgent.post("/schedule/slot").send({
      startTime: "2026-10-01T12:00:00.000Z",
      endTime: "2026-10-01T13:00:00.000Z",
    });
    expect(createRes.status).toBe(200);
    const slotId = createRes.body.slot.id;

    const res = await authAgent.post("/schedule/slot/delete-batch").send({
      slotId,
    });

    expect(res.status).toBe(200);
    expect(res.body.deletedCount).toBe(1);
    expect(res.body.deletedIds).toEqual([slotId]);
  });

  it("returns 404 when slot is missing or not owned by master", async () => {
    const res = await authAgent.post("/schedule/slot/delete-batch").send({
      slotId: 999999,
    });
    expect(res.status).toBe(404);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await unauthAgent.post("/schedule/slot/delete-batch").send({
      slotId: 1,
    });
    expect(res.status).toBe(401);
  });
});
