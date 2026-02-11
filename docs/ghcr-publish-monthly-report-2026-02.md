# GHCR Publish Monthly Report (2026-02)

집계 기준: `scripts/ghcr-report.sh easternkite/guildops 100 monthly` 결과

## 1) 월간 요약
- 대상 월: `2026-02`
- 총 publish 실행: **10**
- 성공/실패: **10 / 0**
- 전월 대비 증감(%): N/A (초기 집계 월)

## 2) 원인별 분류
| 원인 | 실행 수 | 비율 | 비고 |
|---|---:|---:|---|
| main push | 9 | 90% | 기능/문서 머지 후 실행 |
| tag push | 1 | 10% | `v0.1.0-test` 드라이런 |
| workflow_dispatch | 0 | 0% | - |

## 3) 주차별 집계
| 주차 | publish 수 | 성공 | 실패 | 주요 원인 |
|---|---:|---:|---:|---|
| W07 (2/10~2/16) | 10 | 10 | 0 | main push 중심 + tag 드라이런 1회 |

## 4) 비용 추정(간이)
- 빌드 평균 시간(분): 약 2.0
- 월간 총 빌드 시간(분): 약 20
- 추정 비용 메모: 현재는 실행량 낮음, 다만 main push 빈도 증가 시 월간 누적 시간 증가 가능.

## 5) 이슈/개선 포인트
- 불필요 publish 사례: docs-only main push 영향은 `paths` 필터 적용 후 감소.
- 실패 런 공통 원인: 없음(집계 구간 내 0건).
- 다음 달 액션: CI(main) 대비 publish 비율을 함께 추적해 최적화 여지 점검.

## 6) 데이터 스냅샷
```csv
period,total,success,failure,main_push,tag_push,manual
2026-02,10,10,0,9,1,0
```
