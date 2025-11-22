import request from "supertest";
import { Post } from "../database/entity/post";
import "./init";
import { AppDataSource } from "../database/datasource";
import app from "../app";

describe("POST /post", () => {
  it("should save it in database and return it in response", async () => {
    const res = await request(app)
      .post("/post")
      .field("text", "post text")
      .attach(
        "media",
        "/home/pooya/after-life-backend/post-service/src/tests/post-file.png"
      );
    expect(res.body.text).toEqual("post text");

    const postRepository = AppDataSource.getRepository(Post);
    const posts = await postRepository.find();
    expect(posts.length).toEqual(1);
    const fs = require("fs");

    fs.readdir(
      "/home/pooya/after-life-backend/post-service/uploads-test",
      (err: any, files: any) => {
        expect(files.length).toEqual(1);
      }
    );
  });
});

describe("GET /post", () => {
  it("should return all the posts exist in database", async () => {
    const postRepository = AppDataSource.getRepository(Post);

    await postRepository.save([
      { text: "text1", media: "media1" },
      { text: "text1", media: "media1" },
    ]);

    const res = await request(app).get("/post");
    expect(res.body).toEqual([
      { id: 1, text: "text1", media: "media1" },
      { id: 2, text: "text1", media: "media1" },
    ]);
  });
});

describe("GET /post/:id", () => {
  it("should return the specified post", async () => {
    const postRepository = AppDataSource.getRepository(Post);

    await postRepository.save([
      { text: "text1", media: "media1" },
      { text: "text1", media: "media1" },
    ]);

    const res = await request(app).get("/post/1");
    expect(res.body).toEqual({ id: 1, text: "text1", media: "media1" });
  });
});
