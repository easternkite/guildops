# GHCR Report Cron Proposal

목표: GHCR publish 주간/월간 리포트를 자동 생성/보고하는 cron 설계안을 정의한다.

## 1) 자동화 범위
- 주간: `docs/ghcr-publish-weekly-report-YYYYwNN.md` 갱신
- 월간: `docs/ghcr-publish-monthly-report-YYYY-MM.md` 생성/갱신
- 보고: Discord 운영 채널에 요약 1줄 전송

## 2) Cron 스케줄 제안
- Weekly job: 매주 월요일 09:10 KST
- Monthly job: 매월 1일 09:20 KST

## 3) 실행 payload(안)
### Weekly
- script: `scripts/ghcr-report.sh easternkite/guildops 200 weekly`
- output: 주간 markdown 파일 업데이트 + 요약 전송

### Monthly
- script: `scripts/ghcr-report.sh easternkite/guildops 400 monthly`
- output: 월간 markdown 파일 업데이트 + 요약 전송

## 4) 전달 포맷(Discord)
- `[HH:MM][box] GHCR 리포트 · <기간> publish <총N회/성공N/실패N> · main/tag/manual <a/b/c> · 다음 <액션>`

## 5) 실패 처리
- gh 인증 실패: BLOCKED로 큐 기록 + 재시도 요청
- run 데이터 없음: 0건 리포트 생성 후 경고 표시
- 파일 커밋 실패: 로컬 파일만 저장하고 수동 PR 안내

## 6) 도입 순서
1. heartbeat에서 수동 1회 리허설
2. cron job 등록(weekly/monthly)
3. 2주간 결과 비교 후 포맷 고정
