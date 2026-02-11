# GuildOps

게임 길드 운영 OS MVP 모노레포.

## 구조
- `apps/web`: Next.js 14 운영 대시보드
- `apps/api`: NestJS API + Prisma
- `packages/shared`: 공통 zod 스키마/타입

## 로컬 개발 (호스트 실행)
1. `docker compose up -d postgres redis`
2. `pnpm install`
3. `pnpm --filter @guildops/api prisma generate`
4. `pnpm --filter @guildops/api prisma migrate dev`
5. `pnpm dev`

## Docker 전체 실행
```bash
docker compose up --build
```
- Web: http://localhost:3000
- API: http://localhost:4000/api

## 주요 라우트
- Web: `/dashboard`, `/members`, `/events`, `/announcements`, `/attendance`
- API: `/guilds`, `/members`, `/events`, `/announcements`, `/rewards`, `/audit-logs`, `/attendance`, `/auth/discord/*`
