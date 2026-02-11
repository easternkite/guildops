# GHCR Publish Monthly Report Template

월간 GHCR publish 비용/빈도 모니터링 템플릿.
주간 리포트(`docs/ghcr-publish-weekly-report-YYYYwNN.md`)를 월 단위로 누적 집계한다.

## 1) 월간 요약
- 대상 월: `YYYY-MM`
- 총 publish 실행:
- 성공/실패:
- 전월 대비 증감(%):

## 2) 원인별 분류
| 원인 | 실행 수 | 비율 | 비고 |
|---|---:|---:|---|
| main push |  |  |  |
| tag push |  |  |  |
| workflow_dispatch |  |  |  |

## 3) 주차별 집계
| 주차 | publish 수 | 성공 | 실패 | 주요 원인 |
|---|---:|---:|---:|---|
| W1 |  |  |  |  |
| W2 |  |  |  |  |
| W3 |  |  |  |  |
| W4/W5 |  |  |  |  |

## 4) 비용 추정(간이)
- 빌드 평균 시간(분):
- 월간 총 빌드 시간(분):
- 추정 비용 메모:

## 5) 이슈/개선 포인트
- 불필요 publish 사례:
- 실패 런 공통 원인:
- 다음 달 액션:

## 6) 수집 규칙
1. `gh run list --workflow "Publish Docker Images (GHCR)"` 기준으로 월간 데이터 추출.
2. 동일 커밋에서 CI + publish가 함께 돌 경우 publish만 집계.
3. tag 테스트 드라이런은 비고에 표시하고 운영 지표에서 분리 가능.
4. 월말에 `PROJECTS.md`와 `memory/YYYY-MM-DD.md`에 요약 반영.

## 7) 자동 집계 스크립트
- 주간 CSV: `scripts/ghcr-report.sh easternkite/guildops 100 weekly`
- 월간 CSV: `scripts/ghcr-report.sh easternkite/guildops 200 monthly`
- Raw JSON: `scripts/ghcr-report.sh easternkite/guildops 50 raw`
