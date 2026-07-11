import { runHealthChecks } from "./health.service";
import { sendTelegramMessage } from "./notification.service";
import { logger } from "../utils/logger";

const INTERVAL_MS = Number(process.env.HEARTBEAT_INTERVAL_MS) || 5 * 60 * 1000;
const COOLDOWN_MS = Number(process.env.HEARTBEAT_ALERT_COOLDOWN_MS) || 15 * 60 * 1000;
const STARTUP_DELAY_MS = Number(process.env.HEARTBEAT_STARTUP_DELAY_MS) || 30 * 1000;

let lastAlertAt = 0;

function formatFailureMessage(result: Awaited<ReturnType<typeof runHealthChecks>>) {
  const failedChecks = Object.entries(result.checks)
    .filter(([, status]) => status !== "ok")
    .map(([name]) => {
      const error = result.errors[name as keyof typeof result.errors];
      return error ? `${name}: ${error}` : `${name}: error`;
    })
    .join("\n");

  return `🚨 Heartbeat Alert\nStatus: unhealthy\n${failedChecks}`.trim();
}

export async function checkHeartbeat() {
  const result = await runHealthChecks();

  if (result.ok) {
    logger.info({ checks: result.checks, heartbeat: true }, "Heartbeat ok");
    return;
  }

  const now = Date.now();
  if (now - lastAlertAt < COOLDOWN_MS) {
    logger.warn({ checks: result.checks }, "Heartbeat unhealthy (alert suppressed by cooldown)");
    return;
  }

  lastAlertAt = now;
  logger.error({ checks: result.checks, errors: result.errors }, "Heartbeat unhealthy");

  await sendTelegramMessage(formatFailureMessage(result));
}

export function startHeartbeatMonitor() {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  if (process.env.HEARTBEAT_ENABLED === "false") {
    return;
  }

  logger.info({ intervalMs: INTERVAL_MS }, "Starting heartbeat monitor");

  setTimeout(() => {
    checkHeartbeat().catch((err) =>
      logger.error({ err }, "Heartbeat check failed unexpectedly"),
    );
  }, STARTUP_DELAY_MS);

  setInterval(() => {
    checkHeartbeat().catch((err) =>
      logger.error({ err }, "Heartbeat check failed unexpectedly"),
    );
  }, INTERVAL_MS);
}
