import { Router, type Request, type Response } from "express";
import { runHealthChecks } from "../services/health.service";

export async function healthHandler(_req: Request, res: Response) {
  const result = await runHealthChecks();
  res.status(result.ok ? 200 : 503).json(result);
}

export const healthRouter = Router();
healthRouter.get("/", healthHandler);
