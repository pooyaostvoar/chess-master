import { Router } from "express";

import { router as createScheduleRouter } from "./schedule";

export const chatBotRouter = Router();

chatBotRouter.use("/schedule", createScheduleRouter);
