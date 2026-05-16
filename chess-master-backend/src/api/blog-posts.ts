import express from "express";
import {
  getBlogPostById,
  getBlogPostBySlug,
  listBlogPosts,
} from "../services/blog.service";

export const blogPostsRouter = express.Router();

blogPostsRouter.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt((req.query.pageSize as string) || "20", 10), 1),
      100
    );
    const q = (req.query.q as string)?.trim();

    const result = await listBlogPosts({ page, pageSize, q });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

blogPostsRouter.get("/slug/:slug", async (req, res, next) => {
  try {
    const post = await getBlogPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
});

blogPostsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid blog post id" });
    }
    const post = await getBlogPostById(id);
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
});
