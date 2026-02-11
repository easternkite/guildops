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

## GHCR 이미지 배포
- Workflow: `.github/workflows/publish-ghcr.yml`
- 트리거:
  - `main` push 시 `latest` + `sha` 태그 배포
  - `v*.*.*` 태그 push 시 semver 태그 배포
- 이미지:
  - `ghcr.io/easternkite/guildops-api`
  - `ghcr.io/easternkite/guildops-web`

## GHCR 이미지 Pull / 실행
### 1) 로그인 (private 패키지인 경우)
```bash
echo <GITHUB_TOKEN> | docker login ghcr.io -u <github-username> --password-stdin
```

### 2) 이미지 pull
```bash
docker pull ghcr.io/easternkite/guildops-api:latest
docker pull ghcr.io/easternkite/guildops-web:latest
```

### 3) 컨테이너 실행 예시
```bash
docker run -d --name guildops-api \
  -p 4000:4000 \
  -e DATABASE_URL='postgresql://guildops:guildops@<db-host>:5432/guildops' \
  -e REDIS_URL='redis://<redis-host>:6379' \
  ghcr.io/easternkite/guildops-api:latest

docker run -d --name guildops-web \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL='http://localhost:4000/api' \
  ghcr.io/easternkite/guildops-web:latest
```

> 권장: 로컬 개발/통합 실행은 기존 `docker compose up --build` 사용.

## 주요 라우트
- Web: `/dashboard`, `/members`, `/events`, `/announcements`, `/attendance`
- API: `/guilds`, `/members`, `/events`, `/announcements`, `/rewards`, `/audit-logs`, `/attendance`, `/auth/discord/*`
