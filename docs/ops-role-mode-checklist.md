# Ops Role/Mode Checklist (MVP+1)

목적: 운영 모드에서 권한/역할 관리를 명확히 하기 위한 최소 체크리스트.

## 1) 시스템 역할 정의
- [ ] OWNER: 전체 설정/운영 권한
- [ ] OFFICER: 출석/이벤트 운영 권한
- [ ] MEMBER: 조회/참여 중심 권한

## 2) API 접근 정책
- [ ] 역할별 허용 엔드포인트 표 작성
- [ ] `attendance` write 권한 최소 역할 확정
- [ ] 운영자 전용 액션 감사 로그 필드 정의

## 3) 초기 운영 가드레일
- [ ] 기본 role fallback 정책 명시
- [ ] 잘못된 권한 토큰 처리 정책(401/403) 명시
- [ ] Discord OAuth 연동 시 role sync 전략 초안 작성

## Next Slice
- 권한 매트릭스 문서를 API 라우트 단위로 구체화하고, e2e 테스트 시나리오 1개 추가.
