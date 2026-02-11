'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ReleaseHubRefresh() {
  const router = useRouter();
  const [last, setLast] = useState<string | null>(null);

  function refreshNow() {
    router.refresh();
    setLast(new Date().toLocaleTimeString('ko-KR'));
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
      <button type="button" onClick={refreshNow}>상태 새로고침</button>
      <span className="kpi-note">{last ? `마지막 갱신: ${last}` : '아직 수동 갱신 없음'}</span>
    </div>
  );
}
