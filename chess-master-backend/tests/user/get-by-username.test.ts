import { AppDataSource } from "../../src/database/datasource";
import { User } from "../../src/database/entity/user";
import { authAgent, unauthAgent } from "../setup";

describe("GET /users/username/:username", () => {
  it("should return user by username", async () => {
    await unauthAgent.post("/signup").send({
      username: "master_user",
      password: "mypassword",
      email: "master_user@test.com",
    });

    const res = await unauthAgent.get("/users/username/master_user");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe("master_user");
  });

  it("should hide a private user from other people", async () => {
    const repo = AppDataSource.getRepository(User);
    await repo.update({ username: "seeduser" }, { isPrivate: true });

    const res = await unauthAgent.get("/users/username/seeduser");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
  });

  it("should return a private user to themselves", async () => {
    const repo = AppDataSource.getRepository(User);
    await repo.update({ username: "seeduser" }, { isPrivate: true });

    const res = await authAgent.get("/users/username/seeduser");

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe("seeduser");
    expect(res.body.user.isPrivate).toBe(true);
  });

  it("should return 404 when username does not exist", async () => {
    const res = await unauthAgent.get("/users/username/not_existing_user");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
  });
});
