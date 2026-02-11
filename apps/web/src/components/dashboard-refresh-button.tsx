'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DashboardRefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onRefresh() {
    setLoading(true);
    router.refresh();
    setTimeout(() => setLoading(false), 600);
  }

  return (
    <button type="button" onClick={onRefresh} disabled={loading}>
      {loading ? 'Refreshing...' : 'Refresh status'}
    </button>
  );
}
