'use client';

import { useEffect, useMemo, useState } from 'react';

const SIGNOFF_KEY = 'guildops-release-signoff-v1';
const OPS_RESULT_KEY = 'guildops-last-ops-result';
const SIGNOFF_TOTAL = 4;

type OpsResult = {
  status?: 'PASS' | 'FAIL';
  at?: string;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function ReleaseReadinessCard() {
  const [signoffDone, setSignoffDone] = useState(0);
  const [opsResult, setOpsResult] = useState<OpsResult>({});

  useEffect(() => {
    const signoff = readJson<Record<string, boolean>>(SIGNOFF_KEY, {});
    setSignoffDone(Object.values(signoff).filter(Boolean).length);
    setOpsResult(readJson<OpsResult>(OPS_RESULT_KEY, {}));
  }, []);

  const ready = useMemo(() => signoffDone >= SIGNOFF_TOTAL && opsResult.status !== 'FAIL', [signoffDone, opsResult.status]);

  return (
    <article className="kpi-card">
      <h3>릴리즈 readiness</h3>
      <p className={`kpi-value kpi-value-small ${ready ? 'status-ok' : 'status-warn'}`}>
        {ready ? 'Ready to release' : 'Not ready'}
      </p>
      <p className="kpi-note">signoff: {signoffDone}/{SIGNOFF_TOTAL}</p>
      <p className="kpi-note">
        ops: {opsResult.status ?? 'unknown'}
        {opsResult.at ? ` (${new Date(opsResult.at).toLocaleTimeString('ko-KR')})` : ''}
      </p>
      <p className="kpi-note">
        <a href="/release-signoff">사인오프 이동</a> · <a href="/demo-status">데모 상태</a>
      </p>
    </article>
  );
}
