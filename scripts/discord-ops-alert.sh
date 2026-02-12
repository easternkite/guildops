#!/usr/bin/env bash
set -euo pipefail

# Usage examples:
#   ALERT_KIND=attendance-close DISCORD_WEBHOOK_URL=... bash scripts/discord-ops-alert.sh
#   ALERT_KIND=event-start ALERT_EVENT_TITLE='Weekly Raid' ALERT_EVENT_AT='2026-02-13 21:00 KST' DISCORD_WEBHOOK_URL=... bash scripts/discord-ops-alert.sh

WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"
ALERT_KIND="${ALERT_KIND:-attendance-close}"
ALERT_GUILD="${ALERT_GUILD:-guild-demo}"
ALERT_EVENT_TITLE="${ALERT_EVENT_TITLE:-GuildOps Event}"
ALERT_EVENT_AT="${ALERT_EVENT_AT:-미지정}"
ALERT_DETAILS="${ALERT_DETAILS:-}"
MAX_RETRIES="${ALERT_MAX_RETRIES:-3}"
RETRY_DELAY_SEC="${ALERT_RETRY_DELAY_SEC:-2}"

if [ -z "$WEBHOOK_URL" ]; then
  echo "[FAIL] DISCORD_WEBHOOK_URL is required"
  exit 1
fi

if [ "$ALERT_KIND" = "attendance-close" ]; then
  CONTENT="[GuildOps][알림] 출석 마감 시각입니다 · guild=${ALERT_GUILD}${ALERT_DETAILS:+ · ${ALERT_DETAILS}}"
elif [ "$ALERT_KIND" = "event-start" ]; then
  CONTENT="[GuildOps][알림] 이벤트 시작 안내 · title=${ALERT_EVENT_TITLE} · at=${ALERT_EVENT_AT}${ALERT_DETAILS:+ · ${ALERT_DETAILS}}"
else
  CONTENT="[GuildOps][알림] ${ALERT_KIND}${ALERT_DETAILS:+ · ${ALERT_DETAILS}}"
fi

PAYLOAD=$(printf '{"content":"%s"}' "$(printf '%s' "$CONTENT" | sed 's/"/\\"/g')")

attempt=1
while [ "$attempt" -le "$MAX_RETRIES" ]; do
  http_code=$(curl -sS -o /tmp/guildops-discord-alert.out -w "%{http_code}" \
    -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD" || true)

  if [ "$http_code" = "204" ] || [ "$http_code" = "200" ]; then
    echo "[PASS] discord alert sent (attempt=$attempt kind=$ALERT_KIND)"
    exit 0
  fi

  echo "[WARN] discord alert failed (attempt=$attempt/$MAX_RETRIES code=${http_code:-none})"
  if [ "$attempt" -lt "$MAX_RETRIES" ]; then
    sleep "$RETRY_DELAY_SEC"
  fi
  attempt=$((attempt + 1))
done

echo "[FAIL] discord alert send failed after retries"
cat /tmp/guildops-discord-alert.out 2>/dev/null || true
exit 1
