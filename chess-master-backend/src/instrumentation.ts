import { getTempoCredentials } from "./utils/secret";

function getServiceName() {
  return (
    process.env.OTEL_SERVICE_NAME ??
    process.env.LOKI_SERVICE ??
    (process.env.ENV === "production" ? "chess-master-service" : "dev-service")
  );
}

function startInstrumentation() {
  // Avoid loading OTEL auto-instrumentations under Jest — they patch
  // diagnostics_channel and break pino's tracingChannel usage.
  if (process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID != null) {
    return null;
  }

  const tempo = getTempoCredentials();
  if (!tempo) {
    return null;
  }

  // Lazy-require so test imports never load these packages.
  const {
    getNodeAutoInstrumentations,
  } = require("@opentelemetry/auto-instrumentations-node");
  const {
    OTLPTraceExporter,
  } = require("@opentelemetry/exporter-trace-otlp-http");
  const { resourceFromAttributes } = require("@opentelemetry/resources");
  const { NodeSDK } = require("@opentelemetry/sdk-node");
  const {
    ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
    ATTR_SERVICE_NAME,
  } = require("@opentelemetry/semantic-conventions");

  const traceExporter = new OTLPTraceExporter({
    url: `${tempo.endpoint}/v1/traces`,
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${tempo.username}:${tempo.password}`
      ).toString("base64")}`,
    },
  });

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: getServiceName(),
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]:
        process.env.ENV ?? process.env.NODE_ENV ?? "development",
    }),
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
    ],
  });

  sdk.start();

  const shutdown = () => {
    sdk.shutdown().catch(() => undefined);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return sdk;
}

export const otelSdk = startInstrumentation();
export const tracingEnabled = otelSdk !== null;
export const traceServiceName = getServiceName();
