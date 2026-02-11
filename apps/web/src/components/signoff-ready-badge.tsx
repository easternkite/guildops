'use client';

import { useEffect, useMemo, useState } from 'react';

const KEY = 'guildops-release-signoff-v1';
const TOTAL = 4;

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function SignoffReadyBadge() {
  const [checked, setChecked] = useState(0);

  useEffect(() => {
    const state = loadState();
    const done = Object.values(state).filter(Boolean).length;
    setChecked(done);
  }, []);

  const isReady = useMemo(() => checked >= TOTAL, [checked]);

  if (!isReady) return null;

  return <span className="ready-badge">Release Ready</span>;
}
