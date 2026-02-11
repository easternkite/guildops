# Prisma Migration Runbook (Deployment Stabilization)

## 목표
- 배포 시 스키마 변경을 안전하게 적용하고 롤백 판단 기준을 명확히 한다.

## Environment Rules
- **local/dev**: `pnpm --filter @guildops/api prisma:migrate:dev`
- **staging/prod**: `pnpm --filter @guildops/api prisma:migrate:deploy`
  - (script) `apps/api/package.json`의 `prisma:migrate:deploy` 사용
- production에서는 `migrate dev` 금지.

## 배포 플로우 (권장)
1. PR 단계에서 schema 변경 포함 여부 확인
2. CI에서 Prisma Client generate + test 통과 확인
3. 배포 직전 DB 백업/스냅샷 확보
4. 앱 기동 전에 `prisma migrate deploy` 실행
5. 마이그레이션 성공 후 앱 롤링 배포
6. health check 및 핵심 API smoke 확인

## 실패 대응
- migrate 실패 시 앱 배포 중단, 직전 버전 유지
- partial apply가 의심되면 DB 상태 점검 후 수동 복구/핫픽스 마이그레이션 작성
- 롤백은 앱 버전 롤백 + DB 상태 검증을 함께 수행

## 최소 검증 체크리스트
- [ ] migration SQL 리뷰(파괴적 변경 유무)
- [ ] staging에서 `migrate deploy` 사전 검증
- [ ] 운영 배포 시점 lock/트래픽 전략 확인
- [ ] 배포 후 `/health`, 출석 조회/체크인 smoke 확인

## Next
- CI에 migration drift check(읽기 전용) 단계 추가 검토.
