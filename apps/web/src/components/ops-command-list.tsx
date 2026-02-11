'use client';

import { useState } from 'react';

export function OpsCommandList({ commands }: { commands: string[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(cmd: string) {
    await navigator.clipboard.writeText(cmd);
    setCopied(cmd);
    setTimeout(() => setCopied((prev) => (prev === cmd ? null : prev)), 1200);
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {commands.map((cmd) => (
        <div key={cmd} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
          <code>{cmd}</code>
          <button type="button" onClick={() => copy(cmd)}>
            {copied === cmd ? 'Copied' : 'Copy'}
          </button>
        </div>
      ))}
    </div>
  );
}
