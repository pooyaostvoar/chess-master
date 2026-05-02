import { Router } from "express";
import {
  createRouter,
  createPeriodicBatchSlotsRouter,
  getRouter,
  deleteRouter,
  deleteBatchRouter,
  updatePeriodicBatchSlotsRouter,
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
slotRouter.use("", createPeriodicBatchSlotsRouter);
slotRouter.use("", getRouter);
slotRouter.use("", deleteRouter);
slotRouter.use("", deleteBatchRouter);
slotRouter.use("", updatePeriodicBatchSlotsRouter);
slotRouter.use("", reserveRouter);
slotRouter.use("", updateRouter);
slotRouter.use("", updateStatusRouter);
slotRouter.use("", myBookingsRouter);
slotRouter.use("", masterBookingsRouter);
slotRouter.use("", getSlotByIdRouter);