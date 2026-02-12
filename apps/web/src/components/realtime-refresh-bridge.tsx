'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const WS_URL = process.env.NEXT_PUBLIC_REALTIME_WS_URL;

export function RealtimeRefreshBridge() {
  const router = useRouter();
  const [state, setState] = useState<'idle' | 'connected' | 'disconnected'>('idle');

  useEffect(() => {
    if (!WS_URL) return;
    const wsUrl = WS_URL;

    let ws: WebSocket | null = null;
    let closed = false;

    function connect() {
      if (closed) return;
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setState('connected');
      ws.onmessage = () => router.refresh();
      ws.onerror = () => setState('disconnected');
      ws.onclose = () => {
        setState('disconnected');
        if (!closed) setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      closed = true;
      ws?.close();
    };
  }, [router]);

  if (!WS_URL) return null;

  return (
    <span className={`topbar-note ${state === 'connected' ? 'status-ok' : 'status-warn'}`}>
      realtime: {state}
    </span>
  );
}
