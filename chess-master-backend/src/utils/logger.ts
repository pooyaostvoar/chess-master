import { trace } from "@opentelemetry/api";
import pino from "pino";
import { getLokiCredentials } from "./secret";

function getLokiServiceName() {
  return (
    process.env.LOKI_SERVICE ??
    (process.env.ENV === "production" ? "chess-master-service" : "dev-service")
  );
}

function traceLogMixin() {
  const span = trace.getActiveSpan();
  const ctx = span?.spanContext();

  if (!ctx?.traceId) {
    return {};
  }

  return {
    trace_id: ctx.traceId,
    span_id: ctx.spanId,
  };
}

function createLogger() {
  const level = process.env.LOG_LEVEL ?? "info";
  const baseOptions = { level, mixin: traceLogMixin };

  if (process.env.NODE_ENV === "test") {
    return pino({ level: "silent" });
  }

  const loki = getLokiCredentials();

  if (loki) {
    const transport = pino.transport({
      targets: [
        {
          target: "pino-loki",
          options: {
            host: loki.host,
            basicAuth: {
              username: loki.username,
              password: loki.password,
            },
            labels: {
              service: getLokiServiceName(),
              env: process.env.ENV ?? process.env.NODE_ENV ?? "development",
            },
          },
        },
        {
          target: "pino/file",
          options: { destination: 1 },
        },
      ],
    });

    return pino(baseOptions, transport);
  }

  return pino(baseOptions);
}

export const logger = createLogger();

export const lokiServiceName = getLokiServiceName();
