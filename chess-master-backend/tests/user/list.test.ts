import { AppDataSource } from "../../src/database/datasource";
import { User } from "../../src/database/entity/user";
import { authAgent, unauthAgent } from "../setup";
import crypto from "crypto";

describe("GET /users", () => {
  beforeEach(async () => {
    const repo = AppDataSource.getRepository(User);

    // Seed ONLY extra users (auth user already exists via /signup)
    const makePassword = (password: string) => {
      const salt = crypto.randomBytes(16);
      const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256");
      return { salt, hash };
    };

    const usersData = [
      {
        email: "u1@test.com",
        username: "updateduser",
        isMaster: true,
        title: "CM",
        rating: 2200,
        ...makePassword("pass1"),
      },
      {
        email: "u2@test.com",
        username: "regularuser",
        isMaster: false,
        title: null,
        rating: 1500,
        ...makePassword("pass2"),
      },
      {
        email: "u3@test.com",
        username: "grandmaster",
        isMaster: true,
        title: "GM",
        rating: 2500,
        ...makePassword("pass3"),
      },
    ];

    const users = usersData.map((u) =>
      repo.create({
        email: u.email,
        username: u.username,
        isMaster: u.isMaster,
        title: u.title,
        rating: u.rating,
        bio: null,
        profilePicture: null,
        chesscomUrl: null,
        lichessUrl: null,
        password: u.hash,
        salt: u.salt,
      })
    );

    await repo.save(users);
  });

  it("should return all users without filters", async () => {
    const res = await unauthAgent.get("/users");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");

    // 3 seeded users + 1 auth user (seeduser)
    expect(res.body.users.length).toBe(4);
  });

  it("should filter users by username", async () => {
    const res = await unauthAgent.get("/users").query({
      username: "updateduser",
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.users.length).toBe(1);
    expect(res.body.users[0].username).toBe("updateduser");
  });

  it("should filter users by title", async () => {
    const res = await unauthAgent.get("/users").query({
      title: "CM",
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.users.length).toBe(1);
    expect(res.body.users[0].title).toBe("CM");
  });

  it("should filter users by isMaster", async () => {
    const res = await unauthAgent.get("/users").query({
      isMaster: "true",
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.users.length).toBe(2);

    for (const user of res.body.users) {
      expect(user.isMaster).toBe(true);
    }
  });

  it("should filter users by rating range", async () => {
    const res = await unauthAgent.get("/users").query({
      minRating: 2100,
      maxRating: 2300,
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.users.length).toBe(1);

    const user = res.body.users[0];
    expect(user.rating).toBeGreaterThanOrEqual(2100);
    expect(user.rating).toBeLessThanOrEqual(2300);
  });

  it("should allow authenticated users to fetch filtered users", async () => {
    const res = await authAgent.get("/users").query({
      isMaster: "true",
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it("should return empty list when no users match filters", async () => {
    const res = await unauthAgent.get("/users").query({
      username: "definitely_not_existing_user",
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.users).toEqual([]);
  });
});
