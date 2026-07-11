import type { Request } from "express";
import { logger } from "./logger";

function getUserId(req: Request): number | undefined {
  const user = req.user as { id?: number } | undefined;
  return user?.id;
}

export function logRequestError(
  req: Request,
  err: unknown,
  message: string,
  extra?: Record<string, unknown>,
) {
  logger.error(
    {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      userId: getUserId(req),
      ...extra,
      err,
    },
    message,
  );
}
