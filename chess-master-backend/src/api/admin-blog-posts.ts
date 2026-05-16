import express from "express";
import {
  blogPostCreateSchema,
  blogPostUpdateSchema,
} from "@chess-master/schemas";
import { isAdmin } from "../middleware/passport";
import {
  createBlogPost,
  deleteBlogPost,
  updateBlogPost,
} from "../services/blog.service";

export const adminBlogPostsRouter = express.Router();

adminBlogPostsRouter.use(isAdmin);

adminBlogPostsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = blogPostCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsed.error.flatten(),
      });
    }

    try {
      const post = await createBlogPost(parsed.data);
      res.status(201).json(post);
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_SLUG") {
        return res.status(400).json({ message: "Slug is invalid" });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

adminBlogPostsRouter.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = blogPostUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsed.error.flatten(),
      });
    }

    try {
      const post = await updateBlogPost(id, parsed.data);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (err) {
      if (err instanceof Error && err.message === "INVALID_SLUG") {
        return res.status(400).json({ message: "Slug is invalid" });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

adminBlogPostsRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteBlogPost(id);
    if (!deleted) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    res.json({ message: "Blog post deleted" });
  } catch (err) {
    next(err);
  }
});
