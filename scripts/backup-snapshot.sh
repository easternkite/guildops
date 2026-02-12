#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/snapshot-$STAMP.tgz"

mkdir -p "$BACKUP_DIR"

TARGETS=(
  "$ROOT_DIR/apps/api/prisma"
  "$ROOT_DIR/docs/rehearsal-reports"
  "$ROOT_DIR/docs/release-check"
)

EXISTING=()
for t in "${TARGETS[@]}"; do
  if [ -e "$t" ]; then
    EXISTING+=("$t")
  fi
done

if [ "${#EXISTING[@]}" -eq 0 ]; then
  echo "[FAIL] no backup targets found"
  exit 1
fi

tar -czf "$OUT" "${EXISTING[@]}"
echo "[PASS] snapshot created: $OUT"
