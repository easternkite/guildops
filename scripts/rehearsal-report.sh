#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
REPORT_DIR="$ROOT_DIR/docs/rehearsal-reports"
TS="$(date +%Y%m%d-%H%M%S)"
REPORT_PATH="$REPORT_DIR/rehearsal-$TS.md"
INDEX_PATH="$REPORT_DIR/index.md"

mkdir -p "$REPORT_DIR"

run_step() {
  local name="$1"
  shift
  local log
  log="$($@ 2>&1)" || {
    {
      echo "## $name"
      echo "- status: FAIL"
      echo '
```text'
      echo "$log"
      echo '```'
      echo
    } >> "$REPORT_PATH"
    return 1
  }

  {
    echo "## $name"
    echo "- status: PASS"
    echo '
```text'
    echo "$log"
    echo '```'
    echo
  } >> "$REPORT_PATH"
}

{
  echo "# GuildOps Rehearsal Report"
  echo
  echo "- generatedAt: $(date -Iseconds)"
  echo "- branch: $(git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD)"
  echo "- commit: $(git -C "$ROOT_DIR" rev-parse --short HEAD)"
  echo
} > "$REPORT_PATH"

run_step "API Build" npx pnpm --dir "$ROOT_DIR" --filter @guildops/api build
run_step "API Test" npx pnpm --dir "$ROOT_DIR" --filter @guildops/api test
run_step "Demo Reset (guarded)" bash -lc "cd '$ROOT_DIR/apps/api' && ALLOW_DEMO_RESET=true NODE_ENV=development npx pnpm seed:demo:reset"
run_step "Demo Seed" bash -lc "cd '$ROOT_DIR/apps/api' && npx pnpm seed:demo"

{
  echo "## Summary"
  echo "- result: PASS"
  echo "- report: $REPORT_PATH"
} >> "$REPORT_PATH"

{
  echo "# Rehearsal Reports Index"
  echo
  echo "- updatedAt: $(date -Iseconds)"
  echo
  echo "## Reports"
  ls -1t "$REPORT_DIR"/rehearsal-*.md 2>/dev/null | head -n 50 | while read -r file; do
    base="$(basename "$file")"
    ts="${base#rehearsal-}"
    ts="${ts%.md}"
    echo "- [$base](./$base) · $ts"
  done
} > "$INDEX_PATH"

echo "$REPORT_PATH"
