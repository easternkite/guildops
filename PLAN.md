# GuildOps MVP Implementation Plan

1. Initialize pnpm monorepo root files (`package.json`, `pnpm-workspace.yaml`, base TS/format/lint/env/docs config).
2. Create `packages/shared` with Zod domain schemas/types, TypeScript build config, and tests.
3. Create `apps/api` NestJS skeleton with domain modules/controllers/services, DTOs, Prisma/Postgres schema, and seed script.
4. Create `apps/web` Next.js 14 app-router skeleton with Tailwind, required routes, and API wrapper layer.
5. Add Docker infra (`docker-compose.yml`) and per-app `.env.example` files.
6. Wire quality tooling/scripts (lint, build, test) to run from repo root.
7. Run `pnpm install`, then `pnpm lint` and `pnpm build`; fix errors; record final results in `STATUS.md`.
