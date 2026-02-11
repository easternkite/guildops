# GuildOps PRD (Full)

- 문서 버전: 1.0
- 작성일: 2026-02-11
- 대상 릴리즈: MVP 안정화 ~ V1
- 관련 코드베이스: `apps/api`, `apps/web`, `packages/shared`

## 1) 제품 개요

GuildOps는 게임 길드 운영자가 멤버/이벤트/공지/출석/보상/감사 로그를 통합 관리하는 운영 OS다. MVP의 핵심은 출석/체크인 흐름이며, V1에서는 운영 자동화와 지표 기반 의사결정을 강화한다.

## 2) 문제와 목표

### 2.1 문제
- 운영 도구 분산으로 반복 업무가 증가하고 누락/분쟁이 발생.
- 권한 경계가 불명확해 운영 신뢰성 저하.
- 운영 성과(출석률, 활동성, 운영시간 절감)를 정량화하기 어려움.

### 2.2 목표

| 항목 | 목표 값 (V1) |
|---|---:|
| 주간 활성 길드(WAG) | 50+ |
| 출석 이벤트당 체크인 완결률 | 85%+ |
| Free→Paid 전환율 | 5%+ |
| 운영자 주간 업무시간 절감 | 40%+ |

## 3) 범위

### 3.1 In Scope
- 길드 운영 핵심 CRUD: members, events, announcements, attendance, rewards
- 역할 기반 액션 제어(Owner/Admin/Member)
- Discord OAuth 로그인 + 기본 사용자 식별
- 운영 로그 추적(감사 로그)
- 운영자용 웹 콘솔(Next.js App Router)

### 3.2 Out of Scope (현재 릴리즈)
- 실시간 채팅 대체 기능
- 모바일 네이티브 앱
- 복잡한 멀티테넌트 엔터프라이즈 보안 기능(SSO/SCIM)

## 4) 사용자 시나리오

| 시나리오 ID | 사용자 | 시나리오 | 성공 조건 |
|---|---|---|---|
| US-01 | Owner | 길드 출석 이벤트 생성 후 공대원 체크인 현황 확인 | 이벤트 생성 1분 내, 체크인 목록 조회 가능 |
| US-02 | Admin | 이벤트 시작 전 활성 멤버 필터 후 체크인 대행 | 역할/활성 필터로 대상 선택 가능 |
| US-03 | Member | 본인 체크인 등록 | 권한 위반 없이 자기 체크인만 가능 |
| US-04 | Owner | 운영 변경 이력 확인 | 누가/언제/무엇을 변경했는지 조회 가능 |
| US-05 | Admin | 공지 등록 후 전달 상태 추적 | 공지 생성 및 상태 확인 가능 |

## 5) 기능 요구사항

### 5.1 기능 우선순위

| Priority | 요구사항 | 설명 | 수용 기준 |
|---|---|---|---|
| Must | Attendance 관리 | 출석 생성/수정/삭제/조회, 체크인 upsert | API 2xx/4xx 정책 명확, E2E 통과 |
| Must | Member 관리 | 길드별 멤버 조회/등록/상태 변경 | `guildId` 기준 필터링 제공 |
| Must | Role 기반 접근제어 | Owner/Admin/Member 허용 범위 강제 | 금지 액션 403 반환 |
| Must | Discord 인증 | OAuth 및 개발용 토큰 로그인 | `/auth/me`로 사용자 조회 가능 |
| Must | 운영 대시보드 기본 KPI | 출석 수/체크인 수/활성멤버 표시 | 대시보드에서 확인 가능 |
| Should | Events/Announcements 고도화 | DTO 검증, DB 영속화, UX 개선 | CRUD + validation 일관화 |
| Should | Audit Logs 실사용 | 주요 액션 로그 저장/조회 | 최소 5개 핵심 액션 로깅 |
| Should | Rewards 정산 흐름 | 멤버별 보상 기록/조회 | 운영진 워크플로 반영 |
| Could | 자동 리마인더 | 이벤트 전 체크인 리마인더 | 설정 가능 |

### 5.2 상세 요구사항 (도메인별)

#### Attendance
- 출석 생성 시 `guildId`, `game`, `title`, `startsAt` 필수.
- 체크인은 `(attendanceId, memberId)` 유니크 보장.
- Member 권한은 본인(`x-member-id`) 체크인만 허용.
- Owner만 출석 삭제 허용.

#### Members
- 길드 단위 필터 조회 지원.
- 멤버 활성/비활성 상태 전환 가능.
- 출석 체크인에서 비활성 멤버 기본 제외 옵션 제공(웹).

#### Auth
- Discord OAuth 콜백 후 JWT 발급.
- 개발환경에서 토큰 발급 엔드포인트 유지(`POST /auth/token`).

#### Dashboard
- 최소 KPI: 금주 출석 수, 체크인율, 활성 멤버 수.
- 데이터 미존재 시 빈 상태 메시지 제공.

## 6) 비기능 요구사항

| 분류 | 요구사항 | 기준 |
|---|---|---|
| 성능 | 주요 리스트 API 응답 시간 | P95 < 400ms (1k 레코드 기준) |
| 신뢰성 | 배포 안정성 | CI(`lint/test/build`) 100% 통과 |
| 보안 | 인증/권한 | 비인가 접근 401/403 일관 처리 |
| 관측성 | 로깅/지표 | 핵심 액션 추적 이벤트 수집 |
| 확장성 | 모듈 경계 유지 | 도메인별 모듈화 준수 |

## 7) 데이터 요구사항

| 엔터티 | 핵심 필드 | 상태 |
|---|---|---|
| Guild | id, name, game | Prisma 모델 존재 |
| Member | guildId, nickname, role, active | Prisma 모델 + API 연결 |
| Attendance | guildId, game, title, startsAt, status | 핵심 구현 완료 |
| AttendanceCheckIn | attendanceId, memberId, status, checkedInAt | 유니크/업서트 구현 |
| Event / Announcement / Reward / AuditLog | 도메인 필드 | 모델 존재, 서비스 고도화 필요 |

## 8) API 요구사항

| 엔드포인트 그룹 | 요구사항 |
|---|---|
| `/api/attendance` | CRUD + check-in 하위 라우트 + 역할 검증 |
| `/api/members` | guild 필터/CRUD/검증 일관성 |
| `/api/events`, `/api/announcements`, `/api/rewards` | DTO/Validation + DB 기반 동작 |
| `/api/auth/*` | OAuth, dev token, me 조회 안정화 |

## 9) KPI 설계

### 9.1 Product KPI

| KPI | 정의 | 수집 주기 |
|---|---|---|
| WAU (길드) | 7일 내 1회 이상 운영 액션 수행 길드 수 | 주간 |
| 출석 생성 수 | 주간 생성된 attendance 건수 | 주간 |
| 체크인 완료율 | 체크인 완료 인원 / 대상 인원 | 주간 |
| 운영 리텐션 | 4주 연속 활성 길드 비율 | 월간 |

### 9.2 Business KPI

| KPI | 목표 |
|---|---:|
| Free→Paid 전환율 | 5%+ |
| 평균 객단가(ARPA) | $40+ |
| 월 이탈률 | < 5% |
| CAC 회수기간 | < 4개월 |

## 10) 리스크 및 대응

| 리스크 | 영향 | 가능성 | 대응 |
|---|---|---|---|
| 일부 도메인 인메모리 구현 잔존 | 데이터 신뢰 저하 | 높음 | Prisma 전환 우선 배치 |
| 권한 정책 불일치 | 보안/운영 분쟁 | 중간 | 공통 가드/정책 테스트 도입 |
| UI 완성도 부족 | 온보딩 실패 | 중간 | 관리 콘솔 UX 표준 컴포넌트화 |
| 지표 미수집 | 의사결정 지연 | 높음 | 이벤트 스키마 정의 후 즉시 계측 |

## 11) QA 및 검증 계획

| 테스트 유형 | 범위 | 완료 기준 |
|---|---|---|
| Unit | 서비스 로직(권한/검증) | 핵심 분기 커버 |
| API Smoke | 주요 엔드포인트 | 주요 시나리오 2xx/4xx 확인 |
| E2E | 출석 운영 루프 | Owner/Admin/Member 시나리오 통과 |
| UI 검증 | 웹 관리자 플로우 | 주요 작업 3클릭 이내 수행 |

## 12) 릴리즈 체크리스트

- [ ] In-memory 서비스 도메인 최소 3개 이상 DB 전환 완료
- [ ] `pnpm lint && pnpm test && pnpm build` 통과
- [ ] 출석/체크인 권한 회귀 테스트 추가
- [ ] 대시보드 KPI 카드와 빈 상태 처리 구현
- [ ] 문서(운영 runbook/변경사항) 업데이트 완료

## 13) 오픈 이슈

| 이슈 | 결정 필요 항목 | 마감 |
|---|---|---|
| 과금 시스템 | Stripe vs 대체 결제 | 2026-03-06 |
| 권한 모델 | 사용자-멤버 매핑 방식 | 2026-02-27 |
| 감사 로그 범위 | 필수 로깅 액션 목록 | 2026-03-13 |
