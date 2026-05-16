import crypto from "crypto";
import request from "supertest";
import TestAgent from "supertest/lib/agent";
import { AppDataSource } from "../../src/database/datasource";
import { AdminUser } from "../../src/database/entity/admin-user";
import { BlogPost } from "../../src/database/entity/blog-post";
import { app, unauthAgent } from "../setup";

let adminAgent: TestAgent;

const makePassword = (password: string) => {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256");
  return { salt, hash };
};

async function seedAdmin() {
  const repo = AppDataSource.getRepository(AdminUser);
  const { salt, hash } = makePassword("adminpass");
  await repo.save(
    repo.create({
      username: "admin",
      email: "admin@test.com",
      status: "active",
      salt,
      password: hash,
    })
  );

  adminAgent = request.agent(app);
  await adminAgent
    .post("/admin/auth/login")
    .send({ username: "admin", password: "adminpass" })
    .expect(200);
}

async function seedPosts() {
  const repo = AppDataSource.getRepository(BlogPost);
  await repo.save([
    repo.create({
      title: "First Post",
      slug: "firstPost",
      contentHtml: "<p>Hello world</p>",
    }),
    repo.create({
      title: "Second Post",
      slug: "secondPost",
      contentHtml: "<p>More content</p>",
    }),
  ]);
}

describe("Blog posts API", () => {
  beforeEach(async () => {
    await seedAdmin();
    await seedPosts();
  });

  describe("public reads", () => {
    it("GET /posts lists posts without auth", async () => {
      const res = await unauthAgent.get("/posts").expect(200);

      expect(res.body.total).toBe(2);
      expect(res.body.items).toHaveLength(2);
      expect(res.body.items[0]).toMatchObject({
        title: expect.any(String),
        slug: expect.any(String),
        contentHtml: expect.any(String),
      });
    });

    it("GET /posts supports search", async () => {
      const res = await unauthAgent
        .get("/posts")
        .query({ q: "first" })
        .expect(200);

      expect(res.body.total).toBe(1);
      expect(res.body.items[0].slug).toBe("firstPost");
    });

    it("GET /posts/:id returns a post without auth", async () => {
      const list = await unauthAgent.get("/posts").expect(200);
      const id = list.body.items[0].id;

      const res = await unauthAgent.get(`/posts/${id}`).expect(200);

      expect(res.body.id).toBe(id);
      expect(res.body.contentHtml).toContain("<p>");
    });

    it("GET /posts/slug/:slug returns a post without auth", async () => {
      const res = await unauthAgent
        .get("/posts/slug/secondPost")
        .expect(200);

      expect(res.body.slug).toBe("secondPost");
      expect(res.body.title).toBe("Second Post");
    });

    it("GET /posts/:id returns 404 for missing post", async () => {
      await unauthAgent.get("/posts/99999").expect(404);
    });
  });

  describe("admin CUD", () => {
    it("POST /admin/posts requires admin auth", async () => {
      await unauthAgent
        .post("/admin/posts")
        .send({
          title: "Unauthorized",
          contentHtml: "<p>nope</p>",
        })
        .expect(403);
    });

    it("POST /admin/posts creates a post", async () => {
      const res = await adminAgent
        .post("/admin/posts")
        .send({
          title: "New Post",
          slug: "newPost",
          contentHtml: "<p>Created</p>",
        })
        .expect(201);

      expect(res.body).toMatchObject({
        title: "New Post",
        slug: "newPost",
        contentHtml: "<p>Created</p>",
      });

      const listed = await unauthAgent.get("/posts").expect(200);
      expect(listed.body.total).toBe(3);
    });

    it("PATCH /admin/posts/:id updates a post", async () => {
      const list = await unauthAgent.get("/posts").expect(200);
      const id = list.body.items.find(
        (p: { slug: string }) => p.slug === "firstPost"
      ).id;

      const res = await adminAgent
        .patch(`/admin/posts/${id}`)
        .send({ title: "Updated Title" })
        .expect(200);

      expect(res.body.title).toBe("Updated Title");
      expect(res.body.slug).toBe("firstPost");
    });

    it("DELETE /admin/posts/:id removes a post", async () => {
      const list = await unauthAgent.get("/posts").expect(200);
      const id = list.body.items[0].id;

      await adminAgent.delete(`/admin/posts/${id}`).expect(200);

      const after = await unauthAgent.get("/posts").expect(200);
      expect(after.body.total).toBe(1);
      await unauthAgent.get(`/posts/${id}`).expect(404);
    });

    it("PATCH /admin/posts/:id requires admin auth", async () => {
      const list = await unauthAgent.get("/posts").expect(200);
      const id = list.body.items[0].id;

      await unauthAgent
        .patch(`/admin/posts/${id}`)
        .send({ title: "Hacked" })
        .expect(403);
    });

    it("DELETE /admin/posts/:id requires admin auth", async () => {
      const list = await unauthAgent.get("/posts").expect(200);
      const id = list.body.items[0].id;

      await unauthAgent.delete(`/admin/posts/${id}`).expect(403);
    });
  });
});
