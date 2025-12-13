import { Router } from "express";

import { slotRouter } from "./slot";
import { router as finishedEventRouter } from "./finished-event";
export const scheduleRouter = Router();

scheduleRouter.use("/slot", slotRouter);
scheduleRouter.use("/finished-events", finishedEventRouter);
