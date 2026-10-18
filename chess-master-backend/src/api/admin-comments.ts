import express from "express";
import {
  adminCommentCreateListSchema,
  adminCommentListQuerySchema,
  adminCommentListSchema,
  adminCommentUpdateListSchema,
  commentDeletedSchema,
  commentErrorSchema,
  commentIdParamSchema,
  commentListSchema,
  type AdminCommentCreateList,
  type AdminCommentUpdateList,
} from "@chess-master/schemas";
import { parseRequest } from "../middleware/parse-request";
import { isAdmin } from "../middleware/passport";
import {
  createCommentsAsAdmin,
  deleteCommentAsAdmin,
  listCommentsForAdmin,
  updateCommentsAsAdmin,
} from "../services/comment.service";

export const adminCommentsRouter = express.Router();

adminCommentsRouter.use(isAdmin);

function adminCommentError(err: unknown, res: express.Response, next: express.NextFunction) {
  if (err instanceof Error && err.message === "MASTER_NOT_FOUND") {
    return res
      .status(404)
      .json(commentErrorSchema.parse({ message: "Master not found" }));
  }
  if (err instanceof Error && err.message === "USER_NOT_FOUND") {
    return res
      .status(404)
      .json(commentErrorSchema.parse({ message: "User not found" }));
  }
  if (err instanceof Error && err.message === "COMMENT_NOT_FOUND") {
    return res
      .status(404)
      .json(commentErrorSchema.parse({ message: "Comment not found" }));
  }
  return next(err);
}

adminCommentsRouter.post(
  "/",
  parseRequest({ bodyParser: adminCommentCreateListSchema }),
  async (req, res, next) => {
    try {
      const body = req.body as AdminCommentCreateList;
      const items = await createCommentsAsAdmin(body.comments);
      res.status(201).json(commentListSchema.parse({ items }));
    } catch (err) {
      adminCommentError(err, res, next);
    }
  }
);

adminCommentsRouter.patch(
  "/",
  parseRequest({ bodyParser: adminCommentUpdateListSchema }),
  async (req, res, next) => {
    try {
      const body = req.body as AdminCommentUpdateList;
      const items = await updateCommentsAsAdmin(body.comments);
      res.json(commentListSchema.parse({ items }));
    } catch (err) {
      adminCommentError(err, res, next);
    }
  }
);

adminCommentsRouter.get(
  "/",
  parseRequest({ queryParser: adminCommentListQuerySchema }),
  async (req, res, next) => {
    try {
      const query = req.query as unknown as {
        page: number;
        pageSize: number;
        q?: string;
        masterId?: number;
      };
      const result = await listCommentsForAdmin(query);
      res.json(adminCommentListSchema.parse(result));
    } catch (err) {
      next(err);
    }
  }
);

adminCommentsRouter.delete(
  "/:id",
  parseRequest({ paramParser: commentIdParamSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const deleted = await deleteCommentAsAdmin(id);
      if (!deleted) {
        return res
          .status(404)
          .json(commentErrorSchema.parse({ message: "Comment not found" }));
      }
      res.json(commentDeletedSchema.parse({ message: "Comment deleted" }));
    } catch (err) {
      next(err);
    }
  }
);
