import crypto from "crypto";
import request from "supertest";
import TestAgent from "supertest/lib/agent";
import {
  adminCommentListSchema,
  commentDeletedSchema,
  commentErrorSchema,
  commentListSchema,
  commentSchema,
} from "@chess-master/schemas";
import { AppDataSource } from "../../src/database/datasource";
import { AdminUser } from "../../src/database/entity/admin-user";
import { ScheduleSlot } from "../../src/database/entity/schedule-slots";
import { SlotStatus } from "../../src/database/entity/types";
import { User } from "../../src/database/entity/user";
import { app, authAgent, unauthAgent } from "../setup";

let adminAgent: TestAgent;
let otherAgent: TestAgent;
let masterId: number;

const makePassword = (password: string) => {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, "sha256");
  return { salt, hash };
};

async function seedMaster() {
  const repo = AppDataSource.getRepository(User);
  const master = await repo.findOneByOrFail({ username: "seeduser" });
  master.isMaster = true;
  master.title = "GM";
  await repo.save(master);
  masterId = master.id;
}

async function seedOtherUser() {
  otherAgent = request.agent(app);
  await otherAgent
    .post("/signup")
    .send({ username: "commenter", password: "mypassword" })
    .expect(200);
  await otherAgent
    .post("/login")
    .send({ username: "commenter", password: "mypassword" })
    .expect(200);
}

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

async function seedFinishedEvent() {
  const commenter = await AppDataSource.getRepository(User).findOneByOrFail({
    username: "commenter",
  });
  const repo = AppDataSource.getRepository(ScheduleSlot);
  await repo.save(
    repo.create({
      master: { id: masterId } as User,
      reservedBy: { id: commenter.id } as User,
      reservedById: commenter.id,
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 60 * 60 * 1000),
      status: SlotStatus.Booked,
    })
  );
}

async function createComment(text: string) {
  await seedFinishedEvent();
  const res = await otherAgent
    .post("/comments")
    .send({ masterId, text })
    .expect(201);
  return commentSchema.parse(res.body);
}

describe("Comments API", () => {
  beforeEach(async () => {
    await seedMaster();
    await seedOtherUser();
    await seedAdmin();
  });

  describe("GET /comments", () => {
    it("returns comments for a master", async () => {
      await createComment("First note");

      const res = await unauthAgent
        .get("/comments")
        .query({ masterId })
        .expect(200);

      const body = commentListSchema.parse(res.body);
      expect(body.items).toHaveLength(1);
      expect(body.items[0].text).toBe("First note");
      expect(body.items[0].master.username).toBe("seeduser");
      expect(body.items[0].user.username).toBe("commenter");
    });

    it("rejects a missing masterId", async () => {
      const res = await unauthAgent.get("/comments").expect(400);
      expect(res.body.error).toBe("Invalid request data");
    });
  });

  describe("POST /comments", () => {
    it("requires a logged-in user", async () => {
      await unauthAgent
        .post("/comments")
        .send({ masterId, text: "Hello" })
        .expect(401);
    });

    it("rejects an empty comment", async () => {
      const res = await otherAgent
        .post("/comments")
        .send({ masterId, text: "   " })
        .expect(400);

      expect(res.body.error).toBe("Invalid request data");
    });

    it("rejects a comment without a finished event", async () => {
      const res = await otherAgent
        .post("/comments")
        .send({ masterId, text: "Too soon" })
        .expect(403);

      expect(commentErrorSchema.parse(res.body).message).toBe(
        "You can comment after an event with this master"
      );
    });

    it("rejects a second comment for the same master", async () => {
      await createComment("Only once");

      const res = await otherAgent
        .post("/comments")
        .send({ masterId, text: "Again" })
        .expect(409);

      expect(commentErrorSchema.parse(res.body).message).toBe(
        "You already commented on this master"
      );
    });

    it("rejects a comment on someone who is not a master", async () => {
      const repo = AppDataSource.getRepository(User);
      const commenter = await repo.findOneByOrFail({ username: "commenter" });

      const res = await authAgent
        .post("/comments")
        .send({ masterId: commenter.id, text: "Hi" })
        .expect(404);

      expect(commentErrorSchema.parse(res.body).message).toBe(
        "Master not found"
      );
    });
  });

  describe("PATCH /comments/:id", () => {
    it("updates the author's own comment", async () => {
      const created = await createComment("Original");

      const res = await otherAgent
        .patch(`/comments/${created.id}`)
        .send({ text: "Updated" })
        .expect(200);

      const body = commentSchema.parse(res.body);
      expect(body.text).toBe("Updated");
      expect(body.id).toBe(created.id);
    });

    it("forbids editing someone else's comment", async () => {
      const created = await createComment("Mine");

      const res = await authAgent
        .patch(`/comments/${created.id}`)
        .send({ text: "Hijacked" })
        .expect(403);

      expect(commentErrorSchema.parse(res.body).message).toBe(
        "You can only change your own comments"
      );
    });

    it("returns 404 when the comment does not exist", async () => {
      const res = await otherAgent
        .patch("/comments/99999")
        .send({ text: "Missing" })
        .expect(404);

      expect(commentErrorSchema.parse(res.body).message).toBe(
        "Comment not found"
      );
    });
  });

  describe("DELETE /comments/:id", () => {
    it("deletes the author's own comment", async () => {
      const created = await createComment("Remove me");

      const res = await otherAgent.delete(`/comments/${created.id}`).expect(200);
      expect(commentDeletedSchema.parse(res.body).message).toBe(
        "Comment deleted"
      );

      const list = await unauthAgent
        .get("/comments")
        .query({ masterId })
        .expect(200);
      expect(commentListSchema.parse(list.body).items).toHaveLength(0);
    });

    it("forbids deleting someone else's comment", async () => {
      const created = await createComment("Keep me");

      await authAgent.delete(`/comments/${created.id}`).expect(403);
    });
  });

  describe("admin comments", () => {
    it("requires an admin session", async () => {
      await unauthAgent.get("/admin/comments").expect(403);
      await authAgent.get("/admin/comments").expect(403);
      await authAgent
        .post("/admin/comments")
        .send({
          comments: [{ masterId, userId: masterId, text: "Nope" }],
        })
        .expect(403);
      await authAgent
        .patch("/admin/comments")
        .send({ comments: [{ id: 1, text: "Nope" }] })
        .expect(403);
    });

    it("creates a list of comments", async () => {
      const repo = AppDataSource.getRepository(User);
      const commenter = await repo.findOneByOrFail({ username: "commenter" });

      const res = await adminAgent
        .post("/admin/comments")
        .send({
          comments: [
            { masterId, userId: commenter.id, text: "Added by admin" },
            { masterId, userId: masterId, text: "Second note" },
          ],
        })
        .expect(201);

      const body = commentListSchema.parse(res.body);
      expect(body.items).toHaveLength(2);
      expect(body.items[0].text).toBe("Added by admin");
      expect(body.items[0].user.username).toBe("commenter");
      expect(body.items[1].text).toBe("Second note");
      expect(body.items[1].master.username).toBe("seeduser");
    });

    it("creates a user when a comment has a username and no userId", async () => {
      const res = await adminAgent
        .post("/admin/comments")
        .send({
          comments: [
            {
              masterId,
              username: "guest-reviewer",
              text: "From a new user",
            },
          ],
        })
        .expect(201);

      const body = commentListSchema.parse(res.body);
      expect(body.items[0].user.username).toBe("guest-reviewer");

      const created = await AppDataSource.getRepository(User).findOneByOrFail({
        username: "guest-reviewer",
      });
      expect(created.name).toBe("guest-reviewer");
      expect(body.items[0].userId).toBe(created.id);
    });

    it("returns 404 when the user or master does not exist", async () => {
      const missingUser = await adminAgent
        .post("/admin/comments")
        .send({
          comments: [{ masterId, userId: 99999, text: "Missing user" }],
        })
        .expect(404);
      expect(commentErrorSchema.parse(missingUser.body).message).toBe(
        "User not found"
      );

      const missingMaster = await adminAgent
        .post("/admin/comments")
        .send({
          comments: [{ masterId: 99999, userId: masterId, text: "Missing master" }],
        })
        .expect(404);
      expect(commentErrorSchema.parse(missingMaster.body).message).toBe(
        "Master not found"
      );

      const list = await adminAgent.get("/admin/comments").expect(200);
      expect(adminCommentListSchema.parse(list.body).total).toBe(0);
    });

    it("updates a list of comments", async () => {
      const created = await adminAgent
        .post("/admin/comments")
        .send({
          comments: [
            { masterId, userId: masterId, text: "One" },
            { masterId, userId: masterId, text: "Two" },
          ],
        })
        .expect(201);
      const items = commentListSchema.parse(created.body).items;

      const res = await adminAgent
        .patch("/admin/comments")
        .send({
          comments: [
            { id: items[0].id, text: "One updated" },
            { id: items[1].id, text: "Two updated" },
          ],
        })
        .expect(200);

      const body = commentListSchema.parse(res.body);
      expect(body.items.map((item) => item.text)).toEqual([
        "One updated",
        "Two updated",
      ]);
    });

    it("returns 404 when editing a missing comment", async () => {
      const res = await adminAgent
        .patch("/admin/comments")
        .send({ comments: [{ id: 99999, text: "Missing" }] })
        .expect(404);
      expect(commentErrorSchema.parse(res.body).message).toBe(
        "Comment not found"
      );
    });

    it("lists and searches comments", async () => {
      await adminAgent
        .post("/admin/comments")
        .send({
          comments: [
            { masterId, userId: masterId, text: "Opening ideas" },
            { masterId, userId: masterId, text: "Endgame notes" },
          ],
        })
        .expect(201);

      const list = await adminAgent.get("/admin/comments").expect(200);
      const listed = adminCommentListSchema.parse(list.body);
      expect(listed.total).toBe(2);
      expect(listed.page).toBe(1);

      const search = await adminAgent
        .get("/admin/comments")
        .query({ q: "endgame", pageSize: 10 })
        .expect(200);
      const found = adminCommentListSchema.parse(search.body);
      expect(found.total).toBe(1);
      expect(found.items[0].text).toBe("Endgame notes");
      expect(found.pageSize).toBe(10);
    });

    it("rejects an invalid page size", async () => {
      const res = await adminAgent
        .get("/admin/comments")
        .query({ pageSize: 500 })
        .expect(400);

      expect(res.body.error).toBe("Invalid request data");
    });

    it("deletes any comment", async () => {
      const created = await createComment("Moderation");

      const res = await adminAgent
        .delete(`/admin/comments/${created.id}`)
        .expect(200);
      expect(commentDeletedSchema.parse(res.body).message).toBe(
        "Comment deleted"
      );

      const list = await adminAgent.get("/admin/comments").expect(200);
      expect(adminCommentListSchema.parse(list.body).total).toBe(0);
    });

    it("returns 404 when deleting a missing comment", async () => {
      const res = await adminAgent.delete("/admin/comments/99999").expect(404);
      expect(commentErrorSchema.parse(res.body).message).toBe(
        "Comment not found"
      );
    });
  });
});
