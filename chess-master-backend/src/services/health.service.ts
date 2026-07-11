import { AppDataSource } from "../database/datasource";
import { getRedisClient } from "./redis";

export type HealthCheckName = "database" | "redis";
export type HealthCheckStatus = "ok" | "error";

export type HealthResult = {
  ok: boolean;
  checks: Record<HealthCheckName, HealthCheckStatus>;
  errors: Partial<Record<HealthCheckName, string>>;
};

export async function runHealthChecks(): Promise<HealthResult> {
  const checks: Record<HealthCheckName, HealthCheckStatus> = {
    database: "ok",
    redis: "ok",
  };
  const errors: Partial<Record<HealthCheckName, string>> = {};

  try {
    if (!AppDataSource.isInitialized) {
      throw new Error("Database not initialized");
    }
    await AppDataSource.query("SELECT 1");
  } catch (err) {
    checks.database = "error";
    errors.database = err instanceof Error ? err.message : String(err);
  }

  try {
    await getRedisClient().ping();
  } catch (err) {
    checks.redis = "error";
    errors.redis = err instanceof Error ? err.message : String(err);
  }

  return {
    ok: checks.database === "ok" && checks.redis === "ok",
    checks,
    errors,
  };
}
