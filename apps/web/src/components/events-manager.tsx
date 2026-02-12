'use client';

import { useMemo, useState } from 'react';
import { createItem, deleteItem, toUserError, updateItem } from '../lib/api';

type EventItem = {
  id: string;
  guildId: string;
  title: string;
  startsAt: string;
  status?: string;
};

type Recurrence = 'weekly' | 'biweekly' | 'monthly';
type RecurringRule = {
  id: string;
  guildId: string;
  title: string;
  baseStartsAt: string;
  recurrence: Recurrence;
  status: string;
  exceptionDates: string[];
};

const defaultForm = { guildId: '', title: '', startsAt: '', status: 'open' };
const RULES_KEY = 'guildops-event-recurring-rules-v1';

function readRules(): RecurringRule[] {
  try {
    return JSON.parse(localStorage.getItem(RULES_KEY) ?? '[]') as RecurringRule[];
  } catch {
    return [];
  }
}

export function EventsManager({ initialItems }: { initialItems: EventItem[] }) {
  const [items, setItems] = useState<EventItem[]>(initialItems);
  const [form, setForm] = useState(defaultForm);
  const [recurrence, setRecurrence] = useState<Recurrence>('weekly');
  const [rules, setRules] = useState<RecurringRule[]>(readRules);
  const [error, setError] = useState('');

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [items],
  );

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.guildId || !form.title || !form.startsAt) {
      setError('guildId, title, startsAt는 필수입니다.');
      return;
    }
    try {
      const created = await createItem('events', {
        guildId: form.guildId,
        title: form.title,
        startsAt: new Date(form.startsAt).toISOString(),
        status: form.status,
      });
      setItems((prev) => [created, ...prev]);
      setForm(defaultForm);
    } catch (e) {
      setError(toUserError(e));
    }
  }

  function addRecurringRule() {
    setError('');
    if (!form.guildId || !form.title || !form.startsAt) {
      setError('반복 규칙 추가에는 guildId/title/startsAt이 필요합니다.');
      return;
    }
    const nextRule: RecurringRule = {
      id: crypto.randomUUID(),
      guildId: form.guildId,
      title: form.title,
      baseStartsAt: new Date(form.startsAt).toISOString(),
      recurrence,
      status: form.status,
      exceptionDates: [],
    };
    const next = [nextRule, ...rules];
    setRules(next);
    localStorage.setItem(RULES_KEY, JSON.stringify(next));
  }

  async function createNextOccurrence(rule: RecurringRule) {
    setError('');
    const base = new Date(rule.baseStartsAt);
    const deltaDays = rule.recurrence === 'weekly' ? 7 : rule.recurrence === 'biweekly' ? 14 : 30;
    let next = new Date(base.getTime() + deltaDays * 24 * 60 * 60 * 1000);

    while (rule.exceptionDates.includes(next.toISOString().slice(0, 10))) {
      next = new Date(next.getTime() + deltaDays * 24 * 60 * 60 * 1000);
    }

    try {
      const created = await createItem('events', {
        guildId: rule.guildId,
        title: `${rule.title} (${rule.recurrence})`,
        startsAt: next.toISOString(),
        status: rule.status,
      });
      setItems((prev) => [created, ...prev]);

      const updatedRules = rules.map((item) => (item.id === rule.id ? { ...item, baseStartsAt: next.toISOString() } : item));
      setRules(updatedRules);
      localStorage.setItem(RULES_KEY, JSON.stringify(updatedRules));
    } catch (e) {
      setError(toUserError(e));
    }
  }

  function addExceptionToday(rule: RecurringRule) {
    const today = new Date().toISOString().slice(0, 10);
    if (rule.exceptionDates.includes(today)) return;
    const updated = rules.map((item) =>
      item.id === rule.id ? { ...item, exceptionDates: [...item.exceptionDates, today] } : item,
    );
    setRules(updated);
    localStorage.setItem(RULES_KEY, JSON.stringify(updated));
  }

  async function quickStatus(id: string, status: string) {
    setError('');
    try {
      const updated = await updateItem(`events/${id}`, { status });
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
    } catch (e) {
      setError(toUserError(e));
    }
  }

  async function remove(id: string) {
    setError('');
    try {
      await deleteItem(`events/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setError(toUserError(e));
    }
  }

  return (
    <section>
      <h2>Events</h2>
      <p className="dashboard-subtitle">이벤트 목록/생성/상태변경/삭제 + 반복 규칙(주간/격주/월간)</p>

      <form onSubmit={onCreate} style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
        <input placeholder="Guild ID" value={form.guildId} onChange={(e) => setForm((p) => ({ ...p, guildId: e.target.value }))} />
        <input placeholder="Event title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8 }}>
          <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
            <option value="open">open</option>
            <option value="scheduled">scheduled</option>
            <option value="closed">closed</option>
          </select>
          <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)}>
            <option value="weekly">weekly</option>
            <option value="biweekly">biweekly</option>
            <option value="monthly">monthly</option>
          </select>
          <button type="button" onClick={addRecurringRule}>Add recurring rule</button>
        </div>
        <button type="submit">Create event</button>
        {error ? <p className="message error">{error}</p> : null}
      </form>

      <article className="kpi-card" style={{ marginBottom: 12 }}>
        <h3>Recurring Rules</h3>
        {rules.length === 0 ? <p className="kpi-note">등록된 반복 규칙이 없습니다.</p> : null}
        {rules.map((rule) => (
          <p className="kpi-note" key={rule.id}>
            {rule.title} · {rule.recurrence} · next base {new Date(rule.baseStartsAt).toLocaleString('ko-KR')}
            <button type="button" style={{ marginLeft: 8 }} onClick={() => createNextOccurrence(rule)}>Create next</button>
            <button type="button" style={{ marginLeft: 6 }} onClick={() => addExceptionToday(rule)}>Add today exception</button>
          </p>
        ))}
      </article>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>StartsAt</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((event) => (
            <tr key={event.id}>
              <td>{event.title}</td>
              <td>{new Date(event.startsAt).toLocaleString('ko-KR')}</td>
              <td>{event.status ?? 'open'}</td>
              <td style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => quickStatus(event.id, 'open')}>Open</button>
                <button type="button" onClick={() => quickStatus(event.id, 'closed')}>Close</button>
                <button type="button" className="btn-danger" onClick={() => remove(event.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
