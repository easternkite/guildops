#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/docs/demo-status-snapshots"
TS="$(date +%Y%m%d-%H%M%S)"
OUT_PATH="$OUT_DIR/demo-status-$TS.md"

mkdir -p "$OUT_DIR"

set +e
JSON=$(cd "$ROOT_DIR/apps/api" && npx node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const [g,m,e,a,an,r,l]=await Promise.all([p.guild.findUnique({where:{id:'seed-guild-kr'}}),p.member.count({where:{id:{in:['seed-member-1','seed-member-2','seed-member-3']}}}),p.event.findUnique({where:{id:'seed-event-weekly-raid'}}),p.attendance.findUnique({where:{id:'seed-attendance-weekly-raid'}}),p.announcement.findUnique({where:{id:'seed-announcement-1'}}),p.reward.findUnique({where:{id:'seed-reward-1'}}),p.auditLog.findUnique({where:{id:'seed-audit-1'}})]);const checks={guild:!!g,members:m>=3,event:!!e,attendance:!!a,announcement:!!an,reward:!!r,auditLog:!!l};const ok=Object.values(checks).every(Boolean);console.log(JSON.stringify({ok,checks,missing:Object.entries(checks).filter(([,v])=>!v).map(([k])=>k)}));await p.\$disconnect();})().catch(async(err)=>{console.error(err.message||String(err));await p.\$disconnect();process.exit(1);});" 2>/tmp/guildops-demo-status-snapshot.log)
STATUS=$?
set -e

if [ "$STATUS" -ne 0 ] || [ -z "$JSON" ]; then
  JSON='{"ok":false,"checks":{},"missing":["database"],"error":"demo status probe failed"}'
fi

{
  echo "# Demo Status Snapshot"
  echo
  echo "- generatedAt: $(date -Iseconds)"
  echo
  echo "## Overall"
  if echo "$JSON" | grep -q '"ok":true'; then
    echo "- status: PASS"
  else
    echo "- status: FAIL"
  fi
  echo
  echo "## Raw"
  echo '```json'
  echo "$JSON"
  echo '```'

  if [ "$STATUS" -ne 0 ]; then
    echo
    echo "## Probe Error"
    echo '```text'
    cat /tmp/guildops-demo-status-snapshot.log || true
    echo '```'
  fi
} > "$OUT_PATH"

echo "$OUT_PATH"
