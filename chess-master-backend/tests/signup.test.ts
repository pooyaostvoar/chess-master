import { AppDataSource } from "../src/database/datasource";
import { User } from "../src/database/entity/user";
import { unauthAgent } from "./setup";

describe("POST /signup", () => {
  it("should create a new user", async () => {
    const response = await unauthAgent
      .post("/signup")
      .send({ username: "testuser", password: "mypassword" });

    expect(response.body).toEqual({ status: "success" });

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ username: "testuser" });

    expect(user).toBeDefined();
  });
});
