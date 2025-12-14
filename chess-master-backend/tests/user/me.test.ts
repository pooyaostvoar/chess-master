import { AppDataSource } from "../../src/database/datasource";
import { User } from "../../src/database/entity/user";
import { unauthAgent, authAgent } from "../setup";

describe("GET /me", () => {
  it("should return 401 if not authenticated", async () => {
    const res = await unauthAgent.get("/users/me");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });

  it("should return the authenticated user", async () => {
    const res = await authAgent.get("/users/me");

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.username).toBe("seeduser");
  });

  it("should return 401 if authenticated user no longer exists", async () => {
    const repo = AppDataSource.getRepository(User);
    await repo.delete({ username: "seeduser" });

    const res = await authAgent.get("/users/me");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Unauthorized" });
  });
});
