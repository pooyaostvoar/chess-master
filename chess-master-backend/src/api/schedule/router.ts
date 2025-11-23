import { Router } from "express";

import { slotRouter } from "./slot";

export const scheduleRouter = Router();

scheduleRouter.use("/slot", slotRouter);
