'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type ReminderRuleKey = 'event_t_minus_24h' | 'event_t_minus_1h' | 'event_t_plus_2h_no_checkin';

type ReminderSettings = {
  guildId: string;
  webhookUrl: string;
  rules: Record<ReminderRuleKey, { enabled: boolean; channel: string }>;
};

const DEFAULT_RULES: ReminderSettings['rules'] = {
  event_t_minus_24h: { enabled: true, channel: 'discord#announcements' },
  event_t_minus_1h: { enabled: true, channel: 'discord#attendance' },
  event_t_plus_2h_no_checkin: { enabled: true, channel: 'dm' },
};

function storageKey(guildId: string) {
  return `guildops:reminders:${guildId}`;
}

export function RemindersManager() {
  const params = useSearchParams();
  const guildIdFromQuery = params.get('guildId') ?? '';

  const [guildId, setGuildId] = useState(guildIdFromQuery);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [rules, setRules] = useState<ReminderSettings['rules']>(DEFAULT_RULES);

  const [plan, setPlan] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);

  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const validGuildId = useMemo(() => guildId.trim().length > 0, [guildId]);

  useEffect(() => {
    if (!validGuildId) return;
    try {
      const raw = localStorage.getItem(storageKey(guildId));
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
      if (parsed.webhookUrl) setWebhookUrl(parsed.webhookUrl);
      if (parsed.rules) setRules({ ...DEFAULT_RULES, ...parsed.rules } as ReminderSettings['rules']);
    } catch {
      // ignore
    }
  }, [guildId, validGuildId]);

  function persist(next?: Partial<ReminderSettings>) {
    if (!validGuildId) return;
    const payload: ReminderSettings = {
      guildId,
      webhookUrl,
      rules,
      ...(next ?? {}),
    };
    localStorage.setItem(storageKey(guildId), JSON.stringify(payload));
  }

  async function run<T>(label: string, fn: () => Promise<T>) {
    setBusy(label);
    setError(null);
    setNotice(null);
    try {
      const res = await fn();
      setNotice(`${label} OK`);
      return res;
    } catch (err: any) {
      setError(err?.message ?? String(err));
      throw err;
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 260 }}>
            <span className="muted">guildId</span>
            <input value={guildId} onChange={(e) => setGuildId(e.target.value)} placeholder="seed-guild-kr" />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 360, flex: 1 }}>
            <span className="muted">Discord Webhook URL (optional)</span>
            <input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/..."
            />
          </label>

          <button
            className="button"
            disabled={!validGuildId}
            onClick={() => {
              persist();
              setNotice('Saved to localStorage');
            }}
          >
            Save
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 600 }}>Rules (override)</div>

          {(Object.keys(rules) as ReminderRuleKey[]).map((key) => (
            <div
              key={key}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 90px 1fr',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{key}</div>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={rules[key].enabled}
                  onChange={(e) => {
                    const next = {
                      ...rules,
                      [key]: { ...rules[key], enabled: e.target.checked },
                    };
                    setRules(next);
                    persist({ rules: next });
                  }}
                />
                enabled
              </label>
              <input
                value={rules[key].channel}
                onChange={(e) => {
                  const next = {
                    ...rules,
                    [key]: { ...rules[key], channel: e.target.value },
                  };
                  setRules(next);
                  persist({ rules: next });
                }}
                placeholder="discord#announcements"
              />
            </div>
          ))}
        </div>

        {error ? <div className="notice error">{error}</div> : null}
        {notice ? <div className="notice ok">{notice}</div> : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="button"
            disabled={!validGuildId || !!busy}
            onClick={() =>
              run('Fetch plan', async () => {
                const res = await fetch(`/api/guilds/${guildId}/reminder-plan`);
                if (!res.ok) throw new Error(`plan fetch failed: ${res.status}`);
                const json = await res.json();

                // Apply local overrides to view output
                json.rules = json.rules.map((r: any) => {
                  const local = rules[r.key as ReminderRuleKey];
                  if (!local) return r;
                  return { ...r, enabled: local.enabled, channel: local.channel };
                });

                setPlan(json);
                setSyncResult(null);
                return json;
              })
            }
          >
            Preview plan
          </button>

          <button
            className="button"
            disabled={!validGuildId || !!busy}
            onClick={() =>
              run('Sync schedules', async () => {
                const res = await fetch(`/api/guilds/${guildId}/reminder-sync`, { method: 'POST' });
                if (!res.ok) throw new Error(`sync failed: ${res.status}`);
                const json = await res.json();
                setSyncResult(json);
                return json;
              })
            }
          >
            Sync schedules
          </button>

          <button
            className="button"
            disabled={!validGuildId || !!busy || webhookUrl.trim().length === 0}
            onClick={() =>
              run('Send test', async () => {
                const content = `[GuildOps][test] reminders webhook OK · guild=${guildId}`;
                const res = await fetch('/api/notifications/discord-webhook', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ webhookUrl, content, guildId, kind: 'discord-webhook:test' }),
                });
                if (!res.ok) throw new Error(`send failed: ${res.status}`);
                return res.json();
              })
            }
          >
            Send test notification
          </button>
        </div>
      </div>

      {plan ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div style={{ fontWeight: 700 }}>Plan preview</div>
            <span className="muted" style={{ fontSize: 12 }}>
              generatedAt: {String(plan.generatedAt ?? '')}
            </span>
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(plan, null, 2)}</pre>
        </div>
      ) : null}

      {syncResult ? (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontWeight: 700 }}>Sync result</div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(syncResult, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
}
