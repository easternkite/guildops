# GuildOps RUNBOOK

운영 자동화/검증 명령의 단일 진입점입니다.

## 1) Rehearsal (one-shot)

```bash
pnpm ops:rehearsal
```

- API build → API test → demo reset(guarded) → demo seed

## 2) Rehearsal report (markdown)

```bash
pnpm ops:rehearsal:report
```

- 출력: `docs/rehearsal-reports/rehearsal-<timestamp>.md`
- 인덱스: `docs/rehearsal-reports/index.md`
- 보존 개수 조정: `KEEP_REPORTS=<n> pnpm ops:rehearsal:report`

## 3) Release preflight check

```bash
pnpm ops:release-check
```

- 요약: build/test/demoChecklist PASS/FAIL
- 실패 시 가이드: demo seed 재적재 명령 안내 출력

## 4) Demo status snapshot

```bash
pnpm ops:demo-status:snapshot
```

- 출력: `docs/demo-status-snapshots/demo-status-<timestamp>.md`
- DB/probe 실패 시에도 FAIL 스냅샷 + 에러 로그 섹션 생성

## 5) Related UI pages

- Dashboard: `/dashboard`
- Demo status drilldown: `/demo-status`
- Feedback inbox: `/feedback`
