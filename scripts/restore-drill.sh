#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/backups}"
LATEST="$(ls -1t "$BACKUP_DIR"/snapshot-*.tgz 2>/dev/null | head -n 1 || true)"
DRILL_DIR="$ROOT_DIR/.drill-restore"

if [ -z "$LATEST" ]; then
  echo "[FAIL] no snapshot archive found under $BACKUP_DIR"
  exit 1
fi

rm -rf "$DRILL_DIR"
mkdir -p "$DRILL_DIR"

tar -xzf "$LATEST" -C "$DRILL_DIR"

REQUIRED=(
  "$DRILL_DIR$ROOT_DIR/apps/api/prisma"
  "$DRILL_DIR$ROOT_DIR/docs/rehearsal-reports"
)

for path in "${REQUIRED[@]}"; do
  if [ ! -e "$path" ]; then
    echo "[FAIL] restore drill missing: $path"
    exit 1
  fi
done

echo "[PASS] restore drill success: $LATEST"
echo "[INFO] extracted under $DRILL_DIR"
