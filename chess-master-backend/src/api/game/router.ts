import { Router } from "express";

import { router as getRouter } from "./get";
import { router as createRouter } from "./create";
import { router as joinRouter } from "./join";

export const gameRouter = Router();

gameRouter.use("/", getRouter);
gameRouter.use("/", createRouter);
gameRouter.use("/", joinRouter);
