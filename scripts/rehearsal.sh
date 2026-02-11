#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT_DIR/apps/api"

cd "$ROOT_DIR"

echo "[rehearsal] 1/5 build(api)"
npx pnpm --dir "$ROOT_DIR" --filter @guildops/api build

echo "[rehearsal] 2/5 test(api)"
npx pnpm --dir "$ROOT_DIR" --filter @guildops/api test

echo "[rehearsal] 3/5 reset demo data (guarded)"
(
  cd "$API_DIR"
  ALLOW_DEMO_RESET=true NODE_ENV=development npx pnpm seed:demo:reset
)

echo "[rehearsal] 4/5 seed demo data"
(
  cd "$API_DIR"
  npx pnpm seed:demo
)

echo "[rehearsal] done (build/test/reset/seed)"
