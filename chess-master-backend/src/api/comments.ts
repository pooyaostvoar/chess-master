import express from "express";
import {
  commentCreateSchema,
  commentDeletedSchema,
  commentErrorSchema,
  commentIdParamSchema,
  commentListQuerySchema,
  commentListSchema,
  commentSchema,
  commentUpdateSchema,
  type CommentCreate,
  type CommentUpdate,
} from "@chess-master/schemas";
import { User } from "../database/entity/user";
import { parseRequest } from "../middleware/parse-request";
import { isAuthenticated } from "../middleware/passport";
import {
  createCommentForUser,
  deleteOwnComment,
  listCommentsForMaster,
  updateOwnComment,
} from "../services/comment.service";

export const commentsRouter = express.Router();

function handleCommentError(
  err: unknown,
  res: express.Response,
  next: express.NextFunction
) {
  if (err instanceof Error) {
    if (err.message === "MASTER_NOT_FOUND") {
      return res
        .status(404)
        .json(commentErrorSchema.parse({ message: "Master not found" }));
    }
    if (err.message === "COMMENT_NOT_FOUND") {
      return res
        .status(404)
        .json(commentErrorSchema.parse({ message: "Comment not found" }));
    }
    if (err.message === "FORBIDDEN") {
      return res.status(403).json(
        commentErrorSchema.parse({
          message: "You can only change your own comments",
        })
      );
    }
    if (err.message === "NO_SHARED_EVENT") {
      return res.status(403).json(
        commentErrorSchema.parse({
          message: "You can comment after an event with this master",
        })
      );
    }
    if (err.message === "COMMENT_EXISTS") {
      return res.status(409).json(
        commentErrorSchema.parse({
          message: "You already commented on this master",
        })
      );
    }
  }
  return next(err);
}

commentsRouter.get(
  "/",
  parseRequest({ queryParser: commentListQuerySchema }),
  async (req, res, next) => {
    try {
      const { masterId } = req.query as unknown as { masterId: number };
      const items = await listCommentsForMaster(masterId);
      res.json(commentListSchema.parse({ items }));
    } catch (err) {
      next(err);
    }
  }
);

commentsRouter.post(
  "/",
  isAuthenticated,
  parseRequest({ bodyParser: commentCreateSchema }),
  async (req, res, next) => {
    try {
      const body = req.body as CommentCreate;
      const user = req.user as User;
      const comment = await createCommentForUser({
        userId: user.id,
        masterId: body.masterId,
        text: body.text,
      });
      res.status(201).json(commentSchema.parse(comment));
    } catch (err) {
      handleCommentError(err, res, next);
    }
  }
);

commentsRouter.patch(
  "/:id",
  isAuthenticated,
  parseRequest({
    paramParser: commentIdParamSchema,
    bodyParser: commentUpdateSchema,
  }),
  async (req, res, next) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const body = req.body as CommentUpdate;
      const user = req.user as User;
      const comment = await updateOwnComment({
        commentId: id,
        userId: user.id,
        text: body.text,
      });
      res.json(commentSchema.parse(comment));
    } catch (err) {
      handleCommentError(err, res, next);
    }
  }
);

commentsRouter.delete(
  "/:id",
  isAuthenticated,
  parseRequest({ paramParser: commentIdParamSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params as unknown as { id: number };
      const user = req.user as User;
      await deleteOwnComment({ commentId: id, userId: user.id });
      res.json(commentDeletedSchema.parse({ message: "Comment deleted" }));
    } catch (err) {
      handleCommentError(err, res, next);
    }
  }
);
