# GuildOps Demo Quickstart

## 1) Seed demo data

```bash
cd apps/api
pnpm seed
```

Seed 완료 시 JSON으로 demo ID가 출력됩니다.

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

