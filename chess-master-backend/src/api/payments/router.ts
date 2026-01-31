import { Router } from "express";

import { router as checkoutRouter } from "./checkout";

export const paymentRouter = Router();

paymentRouter.use("/", checkoutRouter);
