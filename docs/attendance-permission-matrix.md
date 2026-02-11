# Attendance Permission Matrix (Draft)

| Route | MEMBER | OFFICER | OWNER |
|---|---|---|---|
| `GET /attendance` | ✅ | ✅ | ✅ |
| `GET /attendance/:id` | ✅ | ✅ | ✅ |
| `POST /attendance` | ❌ | ✅ | ✅ |
| `PATCH /attendance/:id` | ❌ | ✅ | ✅ |
| `DELETE /attendance/:id` | ❌ | ❌ | ✅ |
| `GET /attendance/:id/check-ins` | ✅ | ✅ | ✅ |
| `POST /attendance/:id/check-ins` | ✅ (self only) | ✅ | ✅ |

## Notes
- MEMBER의 check-in 쓰기는 자기 자신(memberId 일치)만 허용.
- 삭제 권한은 OWNER에 한정(초기 운영 안정성 우선).
- 다음 단계: 위 매트릭스를 기반으로 권한 미들웨어 + e2e 시나리오 1개 추가.
