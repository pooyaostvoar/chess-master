import { Router } from "express";

import { slotRouter } from "./slot";
import { router as finishedEventRouter } from "./finished-event";
import { router as upcomingEventRouter } from "./upcoming-event";
export const scheduleRouter = Router();

scheduleRouter.use("/slot", slotRouter);
scheduleRouter.use("/finished-events", finishedEventRouter);
scheduleRouter.use("/upcoming-events", upcomingEventRouter);
