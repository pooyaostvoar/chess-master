import { AppDataSource } from "../../src/database/datasource";
import { ScheduleSlot } from "../../src/database/entity/schedule-slots";
import { User } from "../../src/database/entity/user";
import { authAgent, unauthAgent } from "../setup";

describe("POST /schedule/slot/update-periodic-batch-slots", () => {
  it("updates title on all slots with the same periodicSlotConfig and chunkIndex", async () => {
    await authAgent.post("/schedule/slot/create-periodic-batch-slots").send({
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
    const slots = await slotRepo.find({
      where: { master: { id: seedUser!.id } },
      order: { startTime: "ASC" },
    });
    expect(slots).toHaveLength(3);

    const targetId = slots[1].id;
    const res = await authAgent.post("/schedule/slot/update-periodic-batch-slots").send({
      slotId: targetId,
      title: "Batch lesson",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.updatedCount).toBe(3);
    expect(res.body.slots).toHaveLength(3);
    expect(
      res.body.slots.every((s: { title: string }) => s.title === "Batch lesson")
    ).toBe(true);

    const after = await slotRepo.find({
      where: { master: { id: seedUser!.id } },
      order: { startTime: "ASC" },
    });
    expect(after.every((s) => s.title === "Batch lesson")).toBe(true);
  });

  it("updates a single slot when it has no periodic config", async () => {
    const createRes = await authAgent
      .post("/schedule/slot/create-periodic-batch-slots")
      .send({
        interval: {
          start: "2026-10-01T12:00:00.000Z",
          end: "2026-10-01T13:00:00.000Z",
        },
        repeatCount: 1,
      });
    console.log("Create batch response:", createRes.body);
    expect(createRes.status).toBe(200);
    const slotId = createRes.body.slots[0].id;

    const res = await authAgent.post("/schedule/slot/update-periodic-batch-slots").send({
      slotId,
      title: "Solo",
    });

    expect(res.status).toBe(200);
    expect(res.body.updatedCount).toBe(1);
    expect(res.body.slots[0].title).toBe("Solo");
  });

  it("returns 400 when body has no updatable fields", async () => {
    const res = await authAgent.post("/schedule/slot/update-periodic-batch-slots").send({
      slotId: 1,
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 when slot is missing or not owned by master", async () => {
    const res = await authAgent.post("/schedule/slot/update-periodic-batch-slots").send({
      slotId: 999999,
      title: "x",
    });
    expect(res.status).toBe(404);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await unauthAgent.post("/schedule/slot/update-periodic-batch-slots").send({
      slotId: 1,
      title: "x",
    });
    expect(res.status).toBe(401);
  });
});
