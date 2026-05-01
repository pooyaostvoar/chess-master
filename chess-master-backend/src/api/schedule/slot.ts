import { Router } from "express";
import {
  createRouter,
  createBatchSlotsRouter,
  getRouter,
  deleteRouter,
  reserveRouter,
  updateRouter,
  updateStatusRouter,
  myBookingsRouter,
  masterBookingsRouter,
  getSlotByIdRouter,
} from "./slot/index";

export const slotRouter = Router();

// Mount all slot route handlers
slotRouter.use("", createRouter);
slotRouter.use("", createBatchSlotsRouter);
slotRouter.use("", getRouter);
slotRouter.use("", deleteRouter);
slotRouter.use("", reserveRouter);
slotRouter.use("", updateRouter);
slotRouter.use("", updateStatusRouter);
slotRouter.use("", myBookingsRouter);
slotRouter.use("", masterBookingsRouter);
slotRouter.use("", getSlotByIdRouter);