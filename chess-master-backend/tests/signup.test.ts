import request from "supertest";
import { createApp } from "../src/app";
import { AppDataSource } from "../src/database/datasource";
import { User } from "../src/database/entity/user";

const app = createApp();

describe("POST /signup", () => {
  it("creates a new user", async () => {
    const response = await request(app)
      .post("/signup")
      .send({ username: "testuser", password: "mypassword" });

    expect(response.body).toEqual({ status: "success" });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ username: "testuser" });

    expect(user).toBeDefined();
  });
});
