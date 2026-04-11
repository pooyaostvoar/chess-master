import { Router } from "express";

import { router as getMeRouter } from "./get-me";
import { router as editRouter } from "./edit";
import { router as listUsersRouter } from "./list";
import { router as getUserRouter } from "./get";
import { imageRouter } from "./images";
export const usersRouter = Router();

usersRouter.use("/", getMeRouter);
usersRouter.use("/", editRouter);
usersRouter.use("/", listUsersRouter);
usersRouter.use("/", getUserRouter);
usersRouter.use("/", imageRouter);
