# DB Drift Check Runbook (Read-only)

## 목적
- 배포 전/후에 Prisma schema와 실제 DB 상태 불일치를 조기에 탐지한다.

## 권장 명령
- 기본: `pnpm --filter @guildops/api prisma migrate status`
- CI 읽기전용 점검(예시):
  - `pnpm --filter @guildops/api prisma migrate status --schema prisma/schema.prisma`

## 판정 기준
- 정상: pending/failed migration 없음, drift 경고 없음
- 비정상: drift 경고 또는 failed migration 존재

## 비정상 대응
1. 배포 중이면 즉시 중단(앱 롤아웃 hold)
2. 최근 migration 파일/DB 적용 이력 대조
3. 수동 변경 발생 시 SQL 이력 문서화 후 보정 migration 작성
4. staging에서 재검증 후 prod 적용

## CI 도입 제안
- `lint-test-build` 이후 read-only drift check step 추가
- 실패 시 merge block + 운영자 확인 필수

## Next
- 실제 CI 워크플로에 drift check step 추가하고, 실패 메시지 가이드 문구 표준화.
