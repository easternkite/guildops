#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT_DIR/apps/api"

pass() { echo "[PASS] $1"; }
fail() { echo "[FAIL] $1"; }

status_build="FAIL"
status_test="FAIL"
status_demo="FAIL"

if npx pnpm --dir "$ROOT_DIR" --filter @guildops/api build >/tmp/guildops-release-build.log 2>&1; then
  status_build="PASS"; pass "api build"
else
  fail "api build"
fi

if npx pnpm --dir "$ROOT_DIR" --filter @guildops/api test >/tmp/guildops-release-test.log 2>&1; then
  status_test="PASS"; pass "api test"
else
  fail "api test"
fi

DEMO_JSON=$(cd "$API_DIR" && npx node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); const timeout=new Promise((_,rej)=>setTimeout(()=>rej(new Error('demo checklist timeout')),8000)); const run=(async()=>{const [g,m,e,a,an,r,l]=await Promise.all([p.guild.findUnique({where:{id:'seed-guild-kr'}}),p.member.count({where:{id:{in:['seed-member-1','seed-member-2','seed-member-3']}}}),p.event.findUnique({where:{id:'seed-event-weekly-raid'}}),p.attendance.findUnique({where:{id:'seed-attendance-weekly-raid'}}),p.announcement.findUnique({where:{id:'seed-announcement-1'}}),p.reward.findUnique({where:{id:'seed-reward-1'}}),p.auditLog.findUnique({where:{id:'seed-audit-1'}})]);const checks={guild:!!g,members:m>=3,event:!!e,attendance:!!a,announcement:!!an,reward:!!r,auditLog:!!l};const ok=Object.values(checks).every(Boolean);return JSON.stringify({ok,checks,missing:Object.entries(checks).filter(([,v])=>!v).map(([k])=>k)});})(); Promise.race([run,timeout]).then((out)=>{console.log(out);}).catch((err)=>{console.error(err.message); process.exit(1);}).finally(async()=>{await p.\$disconnect();});" 2>/tmp/guildops-release-demo.log || true)

if [ -n "$DEMO_JSON" ] && echo "$DEMO_JSON" | grep -q '"ok":true'; then
  status_demo="PASS"; pass "demo checklist"
else
  fail "demo checklist"
fi

SUMMARY="build=$status_build test=$status_test demoChecklist=$status_demo"
echo "$SUMMARY"

if [ "$status_build" = "PASS" ] && [ "$status_test" = "PASS" ] && [ "$status_demo" = "PASS" ]; then
  exit 0
fi

exit 1
