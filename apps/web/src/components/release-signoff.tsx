'use client';

import { useMemo, useState } from 'react';

type Item = { id: string; label: string };

const KEY = 'guildops-release-signoff-v1';
const ITEMS: Item[] = [
  { id: 'build', label: 'API/Web build 통과' },
  { id: 'tests', label: '핵심 테스트 통과' },
  { id: 'demo', label: 'demo checklist 상태 확인' },
  { id: 'runbook', label: 'RUNBOOK 절차 확인' },
];

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function ReleaseSignoff() {
  const [state, setState] = useState<Record<string, boolean>>(loadState);

  const progress = useMemo(() => {
    const done = ITEMS.filter((i) => state[i.id]).length;
    return { done, total: ITEMS.length };
  }, [state]);

  function toggle(id: string) {
    const next = { ...state, [id]: !state[id] };
    setState(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  return (
    <section>
      <h2>Release Sign-off</h2>
      <p className="dashboard-subtitle">
        배포 전 체크리스트 {progress.done}/{progress.total}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
        {ITEMS.map((item) => (
          <li key={item.id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={!!state[item.id]} onChange={() => toggle(item.id)} />
              {item.label}
            </label>
          </li>
        ))}
      </ul>
      {progress.done === progress.total ? <p className="status-ok">릴리즈 사인오프 준비 완료</p> : null}
    </section>
  );
}
