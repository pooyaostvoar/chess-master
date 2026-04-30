import { unauthAgent } from "../setup";

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

  it("should return 404 when username does not exist", async () => {
    const res = await unauthAgent.get("/users/username/not_existing_user");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
  });
});
