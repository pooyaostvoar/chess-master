import { AppDataSource } from "../../src/database/datasource";
import { ScheduleSlot } from "../../src/database/entity/schedule-slots";
import { User } from "../../src/database/entity/user";
import { SlotStatus } from "../../src/database/entity/types";
import { unauthAgent } from "../setup";

describe("GET /schedule/upcoming-events", () => {
  const masterId = 1;
  const dayFrom = "2030-01-15T00:00:00.000Z";
  const dayTo = "2030-01-16T00:00:00.000Z";

  const saveSlot = async (overrides: Partial<ScheduleSlot> = {}) => {
    const slotRepo = AppDataSource.getRepository(ScheduleSlot);
    return slotRepo.save(
      slotRepo.create({
        master: { id: masterId } as User,
        startTime: new Date("2030-01-15T10:00:00.000Z"),
        endTime: new Date("2030-01-15T11:00:00.000Z"),
        status: SlotStatus.Free,
        title: "Selected day",
        price: 25,
        youtubeId: null,
        ...overrides,
      })
    );
  };

  it("should return only future free slots", async () => {
    await saveSlot({
      startTime: new Date(Date.now() + 3_600_000),
      endTime: new Date(Date.now() + 7_200_000),
      title: "Future free",
    });
    await saveSlot({
      startTime: new Date(Date.now() - 3_600_000),
      endTime: new Date(Date.now() - 1_800_000),
      title: "Past free",
    });
    await saveSlot({
      startTime: new Date(Date.now() + 7_200_000),
      endTime: new Date(Date.now() + 10_800_000),
      status: SlotStatus.Reserved,
      title: "Future reserved",
    });

    const res = await unauthAgent.get("/schedule/upcoming-events");

    expect(res.status).toBe(200);
    expect(res.body.succsess).toBe(true);
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0].title).toBe("Future free");
    expect(res.body.events[0].status).toBe(SlotStatus.Free);
    const master = res.body.events[0].master;
    expect(master).toEqual(
      expect.objectContaining({
        id: masterId,
        username: "seeduser",
      })
    );
    expect(Object.keys(master)).toEqual(
      expect.arrayContaining(["id", "username"])
    );
    for (const key of Object.keys(master)) {
      expect([
        "id",
        "username",
        "title",
        "profilePictureThumbnailUrl",
        "languages",
      ]).toContain(key);
    }
  });

  it("should return only events in the selected from/to range", async () => {
    await saveSlot({
      startTime: new Date("2030-01-15T10:00:00.000Z"),
      endTime: new Date("2030-01-15T11:00:00.000Z"),
      title: "In range",
    });
    await saveSlot({
      startTime: new Date("2030-01-16T10:00:00.000Z"),
      endTime: new Date("2030-01-16T11:00:00.000Z"),
      title: "Next day",
    });
    await saveSlot({
      startTime: new Date("2030-01-14T10:00:00.000Z"),
      endTime: new Date("2030-01-14T11:00:00.000Z"),
      title: "Previous day",
    });

    const res = await unauthAgent.get("/schedule/upcoming-events").query({
      from: dayFrom,
      to: dayTo,
    });

    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0].title).toBe("In range");
  });

  it("should return events ordered by startTime ascending", async () => {
    await saveSlot({
      startTime: new Date("2030-01-15T14:00:00.000Z"),
      endTime: new Date("2030-01-15T15:00:00.000Z"),
      title: "Later",
    });
    await saveSlot({
      startTime: new Date("2030-01-15T10:00:00.000Z"),
      endTime: new Date("2030-01-15T11:00:00.000Z"),
      title: "Sooner",
    });

    const res = await unauthAgent.get("/schedule/upcoming-events").query({
      from: dayFrom,
      to: dayTo,
    });

    expect(res.status).toBe(200);
    expect(res.body.events.map((event: { title: string }) => event.title)).toEqual(
      ["Sooner", "Later"]
    );
  });

  it("should respect limit", async () => {
    await saveSlot({
      startTime: new Date("2030-01-15T10:00:00.000Z"),
      endTime: new Date("2030-01-15T11:00:00.000Z"),
      title: "First",
    });
    await saveSlot({
      startTime: new Date("2030-01-15T12:00:00.000Z"),
      endTime: new Date("2030-01-15T13:00:00.000Z"),
      title: "Second",
    });

    const res = await unauthAgent.get("/schedule/upcoming-events").query({
      from: dayFrom,
      to: dayTo,
      limit: 1,
    });

    expect(res.status).toBe(200);
    expect(res.body.events).toHaveLength(1);
    expect(res.body.events[0].title).toBe("First");
  });

  it("should return an empty list when no events match the date", async () => {
    await saveSlot({
      startTime: new Date("2030-01-16T10:00:00.000Z"),
      endTime: new Date("2030-01-16T11:00:00.000Z"),
      title: "Next day",
    });

    const res = await unauthAgent.get("/schedule/upcoming-events").query({
      from: dayFrom,
      to: dayTo,
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ succsess: true, events: [] });
  });

  it("should allow from or to to be sent on their own", async () => {
    await saveSlot({
      startTime: new Date("2030-01-15T10:00:00.000Z"),
      endTime: new Date("2030-01-15T11:00:00.000Z"),
      title: "In range",
    });
    await saveSlot({
      startTime: new Date("2030-01-16T10:00:00.000Z"),
      endTime: new Date("2030-01-16T11:00:00.000Z"),
      title: "Next day",
    });

    const fromOnly = await unauthAgent.get("/schedule/upcoming-events").query({
      from: dayTo,
    });
    const toOnly = await unauthAgent.get("/schedule/upcoming-events").query({
      to: dayTo,
    });

    expect(fromOnly.status).toBe(200);
    expect(fromOnly.body.events.map((event: { title: string }) => event.title)).toEqual(
      ["Next day"]
    );
    expect(toOnly.status).toBe(200);
    expect(toOnly.body.events.map((event: { title: string }) => event.title)).toEqual(
      ["In range"]
    );
  });

  it("should return 400 for invalid from/to or limit", async () => {
    const invalidDate = await unauthAgent.get("/schedule/upcoming-events").query({
      from: "not-a-date",
      to: dayTo,
    });
    const invalidLimit = await unauthAgent.get("/schedule/upcoming-events").query({
      limit: 0,
    });

    expect(invalidDate.status).toBe(400);
    expect(invalidDate.body.error).toBe("Invalid request data");
    expect(invalidLimit.status).toBe(400);
    expect(invalidLimit.body.error).toBe("Invalid request data");
  });
});
