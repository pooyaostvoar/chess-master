import { AppDataSource } from "../../src/database/datasource";
import { User } from "../../src/database/entity/user";
import { authAgent } from "../setup";

describe("PATCH /users/:id", () => {
  it("should update the authenticated user's profile", async () => {
    const res = await authAgent.patch("/users/1").send({
      username: "updateduser",
      title: "CM",
      rating: 2200,
      bio: "Updated bio",
      isMaster: true,
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");

    const user = res.body.user;
    expect(user).toBeDefined();
    expect(user.username).toBe("updateduser");
    expect(user.title).toBe("CM");
    expect(user.rating).toBe(2200);
    expect(user.isMaster).toBe(true);
  });

  it("should forbid editing another user", async () => {
    const res = await authAgent
      .patch("/users/999") // different user
      .send({ username: "hacker" });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Forbidden/);
  });

  it("should update existing pricing by calling updatePricing twice", async () => {
    await authAgent.patch("/users/1").send({
      username: "updateduser",
      title: "CM",
      rating: 2200,
      bio: "Updated bio",
      isMaster: true,
      pricing: { price5min: 10 },
    });

    let updatedUser = await AppDataSource.getRepository(User).findOne({
      where: { id: 1 },
      relations: ["pricing"],
    });
    expect(updatedUser?.pricing?.price5min).toBe(10);

    await authAgent.patch("/users/1").send({
      username: "updateduser",
      title: "CM",
      rating: 2200,
      bio: "Updated bio",
      isMaster: true,
      pricing: { price10min: 20 },
    });
    updatedUser = await AppDataSource.getRepository(User).findOne({
      where: { id: 1 },
      relations: ["pricing"],
    });
    expect(updatedUser?.pricing?.price5min).toBe(10);
    expect(updatedUser?.pricing?.price10min).toBe(20);
  });
});
