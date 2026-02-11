# GuildOps 2주 스프린트 플랜 (실행형)

- 스프린트 기간: 2026-02-16 (월) ~ 2026-02-27 (금)
- 스프린트 목표: "MVP를 실제 운영 가능한 품질로 끌어올리고, V1 개발 기반을 만든다."
- 기준 브랜치: `main`

## 1) Sprint Goal

1. 인메모리 도메인 최소 2개 이상 Prisma 기반으로 전환.
2. 권한/검증 일관성 정리로 API 신뢰성 개선.
3. 운영자가 바로 쓸 수 있는 최소 대시보드/관리 UX 확보.

## 2) 스프린트 범위

### 2.1 포함 범위
- API: `events`, `announcements`, `rewards` 중 우선 2개 DB 전환
- API: DTO/Validation 표준화 (`any` 제거 우선)
- Web: `dashboard`, `members`, `events`, `announcements` 기본 운영 UI 개선
- QA: 스모크 + 핵심 E2E 시나리오 확장

### 2.2 제외 범위
- 결제 시스템 연동
- 엔터프라이즈 보안(SSO)
- 모바일 전용 UX

## 3) 백로그 (우선순위)

| ID | 타입 | 작업 | 우선순위 | 예상 SP | 담당 |
|---|---|---|---|---:|---|
| BE-01 | API | `events` Prisma 전환 + DTO 추가 | P0 | 5 | Backend |
| BE-02 | API | `announcements` Prisma 전환 + DTO 추가 | P0 | 5 | Backend |
| BE-03 | API | 공통 에러 포맷/validation 메시지 정비 | P1 | 3 | Backend |
| BE-04 | API | audit log 기록 훅(핵심 액션) 도입 | P1 | 3 | Backend |
| FE-01 | Web | `/dashboard` KPI 카드(출석/체크인/활성멤버) | P0 | 5 | Frontend |
| FE-02 | Web | `/members` JSON 출력 → 테이블/필터 UI | P0 | 5 | Frontend |
| FE-03 | Web | `/events`, `/announcements` CRUD 폼 기본화 | P1 | 5 | Frontend |
| QA-01 | QA | attendance 권한 회귀 케이스 추가 | P0 | 3 | QA/Backend |
| QA-02 | QA | e2e smoke 시나리오 확장 | P1 | 3 | QA |
| OPS-01 | Docs | runbook/ops 체크리스트 최신화 | P2 | 2 | PM/EM |

## 4) 일자별 실행 계획

| Day | 날짜 | 목표 | 산출물 |
|---|---|---|---|
| D1 | 2026-02-16 | 스프린트 킥오프/설계 확정 | API 전환 상세 설계 노트 |
| D2-D3 | 2026-02-17~18 | BE-01 구현 | `events` DB CRUD PR |
| D4-D5 | 2026-02-19~20 | BE-02 구현 | `announcements` DB CRUD PR |
| D6 | 2026-02-23 | FE-01 시작 | 대시보드 KPI 카드 초안 |
| D7-D8 | 2026-02-24~25 | FE-02/FE-03 구현 | 운영 UI PR |
| D9 | 2026-02-26 | QA-01/QA-02 실행 | 테스트 리포트 |
| D10 | 2026-02-27 | 안정화/회고 | 릴리즈 노트 + 다음 스프린트 백로그 |

## 5) Definition of Done (DoD)

### Story DoD
- [ ] 기능 요구사항 충족
- [ ] 타입/DTO 검증 적용 (`any` 제거 또는 축소)
- [ ] 단위/통합 테스트 추가
- [ ] 문서 또는 주석 보강

### Sprint DoD
- [ ] `pnpm lint` 통과
- [ ] `pnpm test` 통과
- [ ] `pnpm build` 통과
- [ ] P0 작업 100% 완료
- [ ] P1 작업 70% 이상 완료

## 6) 리스크 보드

| 리스크 | 징후 | 대응 |
|---|---|---|
| Prisma 전환 범위 과대 | 모델/서비스 동시 수정 증가 | 도메인별 PR 분할, 작은 배치 적용 |
| 프론트 리소스 부족 | P0 UI 작업 지연 | 페이지별 최소 기능 우선, 디자인 후순위 |
| 테스트 flaky | CI 재시도 증가 | 고정 데이터/Mock 정리 |
| 권한 회귀 버그 | 403/401 동작 불일치 | 권한 시나리오 테스트 템플릿화 |

## 7) 스크럼 운영 규칙

| 항목 | 운영 방식 |
|---|---|
| 데일리 스탠드업 | 매일 10분, 블로커/당일 목표 중심 |
| PR 규칙 | 300 LOC 내 분할 권장, 리뷰어 1명 이상 |
| 병합 규칙 | CI 통과 + 리뷰 승인 후 merge |
| 이슈 관리 | P0는 당일 triage, P1/P2는 주 2회 정리 |

## 8) 즉시 실행 체크리스트

- [ ] 스프린트 티켓을 `BE/FE/QA/OPS` 라벨로 생성
- [ ] `events`, `announcements` 전환 담당자 확정
- [ ] KPI 카드 데이터 소스(API) 계약 명세 작성
- [ ] 테스트 실행 기준 환경(로컬/CI) 정렬
- [ ] 스프린트 종료 데모 시나리오 확정

