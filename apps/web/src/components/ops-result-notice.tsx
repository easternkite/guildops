'use client';

import { useEffect, useState } from 'react';

type OpsStatus = 'PASS' | 'FAIL';

type OpsResult = {
  status: OpsStatus;
  command: string;
  at: string;
};

const KEY = 'guildops-last-ops-result';

function loadResult(): OpsResult | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OpsResult;
  } catch {
    return null;
  }
}

function saveResult(next: OpsResult) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function OpsResultNotice() {
  const [result, setResult] = useState<OpsResult | null>(null);

  useEffect(() => {
    setResult(loadResult());
  }, []);

  function mark(status: OpsStatus) {
    const next: OpsResult = {
      status,
      command: 'manual-ui-mark',
      at: new Date().toISOString(),
    };
    saveResult(next);
    setResult(next);
  }

  return (
    <div className="ops-notice" role="status" aria-live="polite">
      <span className="topbar-note">
        Ops last run:{' '}
        {result ? (
          <strong className={result.status === 'PASS' ? 'status-ok' : 'status-warn'}>
            {result.status} ({new Date(result.at).toLocaleTimeString('ko-KR')})
          </strong>
        ) : (
          'unknown'
        )}
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        <button type="button" onClick={() => mark('PASS')}>Mark PASS</button>
        <button type="button" className="btn-danger" onClick={() => mark('FAIL')}>Mark FAIL</button>
      </div>
    </div>
  );
}
