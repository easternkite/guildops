# Observability Baseline (MVP Operations)

## 1) Request Log Format (JSON)
필수 필드:
- `ts`: ISO timestamp
- `level`: `info|warn|error`
- `service`: `api|web`
- `env`: `local|staging|prod`
- `requestId`: 요청 추적 ID
- `method`, `path`, `statusCode`, `latencyMs`
- `userId`(가능하면), `guildId`(가능하면)
- `errorCode`, `errorMessage`(에러 시)

예시:
```json
{
  "ts":"2026-02-11T12:30:00.000Z",
  "level":"info",
  "service":"api",
  "env":"staging",
  "requestId":"req_abc123",
  "method":"POST",
  "path":"/api/attendance/a1/check-ins",
  "statusCode":201,
  "latencyMs":42,
  "userId":"u1",
  "guildId":"g1"
}
```

## 2) Minimum Metrics
- `http_requests_total` (method/path/status)
- `http_request_duration_ms` (p50/p95)
- `http_5xx_total`
- `attendance_checkin_total` (status label)
- `auth_token_issue_total`

## 3) Operational SLO (initial)
- API success rate(2xx/3xx): >= 99%
- p95 latency: < 500ms
- 5xx burst alert: 5분간 10회 이상

## 4) Alert Rules (minimal)
- health endpoint 3회 연속 실패
- 5xx 급증(위 기준)
- auth token issue 0건 지속(비정상 트래픽 의심)

## 5) Next Implementation Slice
- Nest interceptor로 request log JSON 표준화
- `/metrics` exporter 도입 여부 결정(Prometheus 호환)
- 대시보드 초안: latency/error/check-in/auth 4패널
