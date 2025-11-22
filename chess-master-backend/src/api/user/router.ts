import { Router } from "express";

import { router as getMeRouter } from "./get-me";
import { router as editRouter } from "./edit";
import { router as listUsersRouter } from "./list";

export const usersRouter = Router();

usersRouter.use("/", getMeRouter);
usersRouter.use("/", editRouter);
usersRouter.use("/", listUsersRouter);
