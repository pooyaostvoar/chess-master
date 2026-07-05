#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT}/docker-compose.dev.yml"

docker compose -f "$COMPOSE_FILE" exec backend \
  npx ts-node --project tsconfig.json -r tsconfig-paths/register \
  src/scripts/create-dev-admin.ts "$@"
