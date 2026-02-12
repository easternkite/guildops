# Backup/Restore Drill Runbook

## 목적
운영 데이터/런북 자산에 대한 스냅샷 생성과 복구 리허설을 정기적으로 검증한다.

## 1) 스냅샷 생성
```bash
pnpm ops:backup:snapshot
```
- 출력: `backups/snapshot-YYYYMMDD-HHMMSS.tgz`

## 2) 복구 드릴 실행
```bash
pnpm ops:restore:drill
```
- 최신 스냅샷을 `.drill-restore`에 풀어 주요 경로 존재 여부를 검증한다.

## 3) 실패 시 대응
- `no snapshot archive found` → 먼저 `pnpm ops:backup:snapshot` 실행
- `restore drill missing` → 스냅샷 대상 경로가 누락되었는지 확인 후 스크립트 대상 업데이트

## 운영 권장
- 배포 전 최소 1회 드릴 실행
- 주 1회 스케줄링해 PASS/FAIL 기록 유지
