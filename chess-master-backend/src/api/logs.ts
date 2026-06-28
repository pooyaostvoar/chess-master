import { SpanStatusCode, trace } from "@opentelemetry/api";
import { Router } from "express";
import { randomUUID } from "crypto";
import { logger, lokiServiceName } from "../utils/logger";
import { traceServiceName, tracingEnabled } from "../instrumentation";

export const logsRouter = Router();

logsRouter.get("/test", (_req, res) => {
  const requestId = randomUUID();

  logger.info(
    { requestId, endpoint: "/logs/test" },
    "Loki test info log — search for this requestId in Grafana",
  );

  logger.info("second log in api");

  res.json({
    ok: true,
    message: "Info log sent to Loki",
    requestId,
    hint:
      'In Grafana Explore, query: {service="' +
      lokiServiceName +
      '"} |= "' +
      requestId +
      '"',
  });
});

logsRouter.get("/error", (_req, res) => {
  const requestId = randomUUID();

  logger.error(
    {
      requestId,
      endpoint: "/logs/error",
      err: new Error("Sample error for Loki testing"),
    },
    "Loki test error log — search for this requestId in Grafana",
  );

  res.json({
    ok: true,
    message: "Error log sent to Loki",
    requestId,
    hint:
      'In Grafana Explore, query: {service="' +
      lokiServiceName +
      '"} |= "' +
      requestId +
      '"',
  });
});

logsRouter.get("/trace", (_req, res) => {
  const requestId = randomUUID();
  const tracer = trace.getTracer("chess-master-backend");

  tracer.startActiveSpan("logs.trace-test", (span) => {
    const { traceId, spanId } = span.spanContext();

    span.setAttribute("requestId", requestId);
    span.setAttribute("http.route", "/logs/trace");

    logger.info(
      { requestId, endpoint: "/logs/trace" },
      "Trace test log — open this traceId in Grafana Tempo",
    );

    span.setStatus({ code: SpanStatusCode.OK });

    res.json({
      ok: true,
      tracingEnabled,
      message: tracingEnabled
        ? "Trace and correlated log sent"
        : "Tracing is disabled (missing Tempo credentials)",
      requestId,
      traceId,
      spanId,
      service: traceServiceName,
      hint: tracingEnabled
        ? `In Grafana Tempo, search trace ID: ${traceId}`
        : "Add secrets/tempo_host.txt (and user/token) then recreate the backend container",
      lokiHint:
        'Correlated log query: {service="' +
        lokiServiceName +
        '"} |= "' +
        requestId +
        '"',
    });
  });
});
