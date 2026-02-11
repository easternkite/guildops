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

const defaultForm = { guildId: '', title: '', startsAt: '', status: 'open' };

export function EventsManager({ initialItems }: { initialItems: EventItem[] }) {
  const [items, setItems] = useState<EventItem[]>(initialItems);
  const [form, setForm] = useState(defaultForm);
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
      <p className="dashboard-subtitle">이벤트 목록/생성/상태변경/삭제</p>

      <form onSubmit={onCreate} style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
        <input placeholder="Guild ID" value={form.guildId} onChange={(e) => setForm((p) => ({ ...p, guildId: e.target.value }))} />
        <input placeholder="Event title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))} />
        <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
          <option value="open">open</option>
          <option value="scheduled">scheduled</option>
          <option value="closed">closed</option>
        </select>
        <button type="submit">Create event</button>
        {error ? <p className="message error">{error}</p> : null}
      </form>

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
