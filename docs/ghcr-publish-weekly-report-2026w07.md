# GHCR Publish Weekly Report (2026-W07)

집계 기준: `Publish Docker Images (GHCR)` 최근 실행 로그 (`gh run list --workflow`)

## Summary
- 총 publish 실행: **9회**
- 성공: **9회**
- 실패: **0회**

## 원인별 분류
- `main` push: **8회**
- `tag` push (`v0.1.0-test`): **1회**
- `workflow_dispatch`: **0회**

## 해석
- docs-only 변경으로 인한 불필요 publish는 `paths` 필터 적용 이후 감소 방향.
- tag 기반 publish는 드라이런 1회에서 정상 동작 확인(run `21912762205`).

## 최근 실행 표
| run_id | branch/tag | event | conclusion | created_at(UTC) |
|---:|---|---|---|---|
| 21912762205 | v0.1.0-test | push | success | 2026-02-11T16:07:39Z |
| 21912646890 | main | push | success | 2026-02-11T16:04:38Z |
| 21912418813 | main | push | success | 2026-02-11T15:58:34Z |
| 21910264168 | main | push | success | 2026-02-11T15:01:19Z |
| 21909962515 | main | push | success | 2026-02-11T14:53:13Z |
| 21909332249 | main | push | success | 2026-02-11T14:36:12Z |
| 21908174529 | main | push | success | 2026-02-11T14:03:55Z |
| 21907578470 | main | push | success | 2026-02-11T13:46:18Z |
| 21907465088 | main | push | success | 2026-02-11T13:42:57Z |

## Next
- 다음 주 보고부터 `CI(main)` run 수와 함께 비교해 publish/CI 비율 추적.
- 월 단위로 GHCR 스토리지 증가량과 연계해 비용 추정치 추가.
