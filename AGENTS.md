# AGENTS.md (for Codex / contributors)

GuildOps monorepo working guide.  
목표: **안전하게 빠르게** 기능 추가하고, lint/build 깨지지 않게 유지.

## 1) Project overview
- Product: Game Guild Operations OS (MVP)
- Stack:
  - `apps/api` = NestJS + Prisma + PostgreSQL
  - `apps/web` = Next.js 14 (App Router)
  - `packages/shared` = shared zod schemas/types

## 2) Monorepo layout
- `apps/api/src/modules/*` : domain modules (guilds, members, events, announcements, rewards, attendance, audit-logs, auth)
- `apps/api/prisma/*` : schema + seed
- `apps/web/src/app/*` : pages/routes
- `apps/web/src/components/*` : UI components
- `packages/shared/src/*` : reusable schema/type

## 3) Dev commands (root)
```bash
pnpm install
pnpm lint
pnpm test
pnpm build
pnpm dev
```

### API-only
```bash
pnpm --filter @guildops/api dev
pnpm --filter @guildops/api prisma:generate
pnpm --filter @guildops/api prisma:migrate
pnpm --filter @guildops/api seed
```

### Web-only
```bash
pnpm --filter @guildops/web dev
```

## 4) Docker
```bash
docker compose up --build
```
- web: `http://localhost:3000`
- api: `http://localhost:4000/api`
- postgres/redis included in compose

## 5) Coding conventions
- TypeScript strict 유지 (`tsconfig.base.json` 기준)
- Keep changes small and domain-scoped (module boundary respect)
- No cross-layer hacks (web should call API, not DB directly)
- Prefer explicit DTO/schema over loose `any`
- Update docs when behavior/commands change

## 6) API conventions (Nest)
- 1 domain = 1 module (`controller + service + module`)
- REST endpoints under `/api/*` (global prefix set in `main.ts`)
- New domain adds:
  1. Prisma model (if needed)
  2. Module/controller/service
  3. `AppModule` imports
  4. shared schema updates if used by web

## 7) Web conventions (Next App Router)
- Route files under `src/app/**/page.tsx`
- Keep fetch wrappers in `src/lib/api.ts`
- Server-first rendering unless client interactivity needed
- Keep UI simple/admin-focused for MVP

## 8) Prisma workflow
1. edit `apps/api/prisma/schema.prisma`
2. run `pnpm --filter @guildops/api prisma:generate`
3. run migration (`prisma migrate dev`)
4. update seed (`apps/api/prisma/seed.ts`) if needed

## 9) CI expectations
GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR:
- `pnpm lint`
- `pnpm test`
- `pnpm build`

Before PR, run same commands locally.

## 10) Commit / PR convention
- Commit style: `feat(scope): ...`, `fix(scope): ...`, `chore(scope): ...`
- PR should include:
  - what changed
  - why
  - how to verify (commands)
  - screenshots for web UI updates

## 11) Safe-change checklist
- [ ] Scope understood (no unrelated refactor)
- [ ] Lint/Test/Build pass
- [ ] Env/README updated if needed
- [ ] DB schema changes accompanied by migration/seed updates
- [ ] Backward compatibility checked for existing routes
