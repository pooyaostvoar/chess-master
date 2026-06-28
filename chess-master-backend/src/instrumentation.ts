import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
  ATTR_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions";
import { getTempoCredentials } from "./utils/secret";

function getServiceName() {
  return (
    process.env.OTEL_SERVICE_NAME ??
    process.env.LOKI_SERVICE ??
    (process.env.ENV === "production" ? "chess-master-service" : "dev-service")
  );
}

function startInstrumentation() {
  if (process.env.NODE_ENV === "test") {
    return null;
  }

  const tempo = getTempoCredentials();
  if (!tempo) {
    return null;
  }

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
