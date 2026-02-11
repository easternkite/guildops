# Attendance Authorization E2E Scenario (Draft)

## Scenario: MEMBER cannot check-in for another member

1. 준비: 같은 길드에 `memberA(MEMBER)`, `memberB(MEMBER)` 생성
2. `memberA` 토큰으로 `POST /attendance/:id/check-ins` 요청 시 `memberId=memberB` 전달
3. 기대 결과: `403 Forbidden` + 권한 에러 코드 반환
4. 회귀 확인: `memberId=memberA`로 요청 시에는 `201/200` 성공

## Implementation Note
- 권한 가드에서 `role === MEMBER`일 때 `request.user.memberId === body.memberId` 강제.
