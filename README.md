# GuildOps

게임 길드 운영 OS MVP 모노레포.

## 구조
- `apps/web`: Next.js 14 운영 대시보드
- `apps/api`: NestJS API + Prisma
- `packages/shared`: 공통 zod 스키마/타입

## 시작
1. `docker compose up -d`
2. `pnpm install`
3. `pnpm --filter @guildops/api prisma migrate dev`
4. `pnpm dev`

## 주요 라우트
- Web: `/dashboard`, `/members`, `/events`, `/announcements`
- API: `/guilds`, `/members`, `/events`, `/announcements`, `/rewards`, `/audit-logs`
