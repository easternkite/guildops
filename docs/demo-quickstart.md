# GuildOps Demo Quickstart

## 1) Seed demo data

```bash
cd apps/api
pnpm seed:demo
```

Seed 완료 시 JSON으로 demo ID가 출력됩니다.

### Demo reset (안전장치 포함)

```bash
cd apps/api
ALLOW_DEMO_RESET=true NODE_ENV=development pnpm seed:demo:reset
pnpm seed:demo
```

- `ALLOW_DEMO_RESET=true` 없으면 reset 실행이 거부됩니다.
- `NODE_ENV=production`에서는 reset 실행이 거부됩니다.

## 2) Demo flow (5분)

1. `/dashboard`에서 KPI 카드 확인 (출석수/체크인율/활성멤버/최근이벤트)
2. `/members`에서 role 필터 + active 토글 시연
3. `/events`에서 이벤트 생성 후 status open/closed 변경
4. `/announcements`에서 공지 생성/수정/삭제
5. `/attendance/{seed-attendance-weekly-raid}`에서 체크인 상태 업데이트(중복 방지 UX 확인)

## 3) Screenshot checklist

- [ ] Dashboard KPI cards
- [ ] Members filter + toggle
- [ ] Events create + status update
- [ ] Announcements CRUD
- [ ] Attendance check-in update flow

## 4) 운영 리허설(one-shot)

```bash
cd /path/to/guildops
pnpm ops:rehearsal
```

실행 항목: API build → API test → demo reset(guarded) → demo seed

리허설 결과를 markdown 리포트로 남기려면:

```bash
pnpm ops:rehearsal:report
```

- 출력: `docs/rehearsal-reports/rehearsal-<timestamp>.md`
- 기본 보존 개수: 최근 30개 (`KEEP_REPORTS=<n> pnpm ops:rehearsal:report`로 조정)

릴리즈 전 핵심 점검(build/test/demo checklist)은:

```bash
pnpm ops:release-check
```

