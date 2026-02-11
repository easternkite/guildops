# Tag-based GHCR Publish Validation Runbook

목표: `publish-ghcr.yml`의 `push.tags(v*.*.*)` 트리거가 `paths` 필터와 함께 의도대로 동작하는지 검증한다.

## 사전 조건
- `main` 최신 반영
- GHCR 권한(`packages:write`) 정상
- 워크플로 파일 최신(`.github/workflows/publish-ghcr.yml`)

## 검증 시나리오

### Case A: docs-only 커밋 + main push
- 기대: CI만 실행, GHCR Publish 미실행
- 확인: Actions에서 `Publish Docker Images (GHCR)`가 skipped/미트리거

### Case B: 코드 변경 커밋 + main push
- 기대: CI + GHCR Publish 실행
- 확인: API/Web 이미지 빌드/푸시 성공

### Case C: tag push (`vX.Y.Z`)
- 기대: `paths`와 무관하게 GHCR Publish 실행
- 절차:
  1. `git checkout main && git pull --ff-only`
  2. `git tag v0.1.0-test`
  3. `git push origin v0.1.0-test`
  4. Actions에서 `Publish Docker Images (GHCR)` 실행 여부/결과 확인
  5. 검증 후 태그 정리: `git push --delete origin v0.1.0-test && git tag -d v0.1.0-test`

## 합격 기준
- A/B/C 기대 결과 모두 일치
- tag 기반 publish에서 `ghcr.io/<owner>/guildops-api` 및 `guildops-web` 이미지 태깅 정상

## 최근 드라이런 기록
- 일시: 2026-02-12 01:xx KST
- 테스트 태그: `v0.1.0-test`
- 실행 결과: `Publish Docker Images (GHCR)` run `21912762205` 성공
- 정리: 원격/로컬 테스트 태그 삭제 완료

## 장애 시 대응
- 태그 push인데 publish 미실행: `on.push.tags` 패턴 및 workflow syntax 확인
- docs-only인데 publish 실행: `paths` 범위 재검토
- publish 실패: GHCR 로그인 단계(`GITHUB_TOKEN`) 권한 및 Dockerfile 빌드 로그 점검
