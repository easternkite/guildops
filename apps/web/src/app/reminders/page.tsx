import { Suspense } from 'react';
import { RemindersManager } from '../../components/reminders-manager';

export default function RemindersPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <h1 style={{ margin: 0 }}>Reminders</h1>
        <p style={{ margin: 0, color: '#6b7280' }}>
          길드별 리마인더 규칙/채널 기본값(override)과 plan/sync 실행을 관리합니다.
        </p>
      </div>

      <Suspense fallback={<div className="card">Loading…</div>}>
        <RemindersManager />
      </Suspense>
    </div>
  );
}
