import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { logger } from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

function getUserId(req: Request): number | undefined {
  const user = req.user as { id?: number } | undefined;
  return user?.id;
}

function getRequestLogFields(req: Request) {
  return {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    userId: getUserId(req),
  };
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.requestId = randomUUID();
  const start = Date.now();

  logger.info(getRequestLogFields(req), "Incoming request");

  res.on("finish", () => {
    const fields = {
      ...getRequestLogFields(req),
      statusCode: res.statusCode,
      durationMs: Date.now() - start,
    };

    if (res.statusCode >= 500) {
      logger.error(fields, "Request completed with server error");
    } else if (res.statusCode >= 400) {
      logger.warn(fields, "Request completed with client error");
    } else {
      logger.info(fields, "Request completed");
    }
  });

  next();
}
