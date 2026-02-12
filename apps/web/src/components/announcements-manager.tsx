'use client';

import { useMemo, useState } from 'react';
import { createItem, deleteItem, toUserError, updateItem } from '../lib/api';

type Announcement = {
  id: string;
  guildId: string;
  title: string;
  content: string;
  createdAt?: string;
};

type ScheduleRepeat = 'none' | 'daily' | 'weekly';
type ScheduleItem = {
  id: string;
  guildId: string;
  title: string;
  content: string;
  at: string;
  repeat: ScheduleRepeat;
};
type PublishHistory = { id: string; title: string; at: string; repeat: ScheduleRepeat };

const defaultForm = { guildId: '', title: '', content: '' };
const SCHEDULE_KEY = 'guildops-announcement-schedules-v1';
const HISTORY_KEY = 'guildops-announcement-publish-history-v1';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function AnnouncementsManager({ initialItems }: { initialItems: Announcement[] }) {
  const [items, setItems] = useState<Announcement[]>(initialItems);
  const [form, setForm] = useState(defaultForm);
  const [scheduleAt, setScheduleAt] = useState('');
  const [scheduleRepeat, setScheduleRepeat] = useState<ScheduleRepeat>('none');
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => readJson<ScheduleItem[]>(SCHEDULE_KEY, []));
  const [history, setHistory] = useState<PublishHistory[]>(() => readJson<PublishHistory[]>(HISTORY_KEY, []));
  const [error, setError] = useState('');

  const sorted = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()),
    [items],
  );

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.guildId || !form.title || !form.content.trim()) {
      setError('guildId, title, content는 필수입니다.');
      return;
    }
    try {
      const created = await createItem('announcements', form);
      setItems((prev) => [created, ...prev]);
      setForm(defaultForm);
    } catch (e) {
      setError(toUserError(e));
    }
  }

  function addSchedule() {
    setError('');
    if (!form.guildId || !form.title || !form.content.trim() || !scheduleAt) {
      setError('예약 발행은 guildId/title/content/scheduleAt이 필요합니다.');
      return;
    }
    const next: ScheduleItem[] = [
      {
        id: crypto.randomUUID(),
        guildId: form.guildId,
        title: form.title,
        content: form.content,
        at: new Date(scheduleAt).toISOString(),
        repeat: scheduleRepeat,
      },
      ...schedules,
    ];
    setSchedules(next);
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(next));
  }

  async function runSchedule(item: ScheduleItem) {
    setError('');
    try {
      const created = await createItem('announcements', {
        guildId: item.guildId,
        title: item.title,
        content: item.content,
      });
      setItems((prev) => [created, ...prev]);

      const historyNext: PublishHistory[] = [
        { id: crypto.randomUUID(), title: item.title, at: new Date().toISOString(), repeat: item.repeat },
        ...history,
      ].slice(0, 20);
      setHistory(historyNext);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(historyNext));

      const scheduleNext = schedules
        .map((s) => {
          if (s.id !== item.id) return s;
          if (s.repeat === 'daily') return { ...s, at: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString() };
          if (s.repeat === 'weekly') return { ...s, at: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() };
          return null;
        })
        .filter(Boolean) as ScheduleItem[];

      setSchedules(scheduleNext);
      localStorage.setItem(SCHEDULE_KEY, JSON.stringify(scheduleNext));
    } catch (e) {
      setError(toUserError(e));
    }
  }

  async function quickEdit(item: Announcement) {
    const nextTitle = prompt('새 공지 제목', item.title);
    if (!nextTitle) return;
    setError('');
    try {
      const updated = await updateItem(`announcements/${item.id}`, { title: nextTitle });
      setItems((prev) => prev.map((ann) => (ann.id === item.id ? updated : ann)));
    } catch (e) {
      setError(toUserError(e));
    }
  }

  async function remove(id: string) {
    setError('');
    try {
      await deleteItem(`announcements/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setError(toUserError(e));
    }
  }

  return (
    <section>
      <h2>Announcements</h2>
      <p className="dashboard-subtitle">공지 목록/생성/수정/삭제 + 예약/반복 발행 + 발행 이력</p>

      <form onSubmit={onCreate} style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
        <input placeholder="Guild ID" value={form.guildId} onChange={(e) => setForm((p) => ({ ...p, guildId: e.target.value }))} />
        <input placeholder="Announcement title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
        <textarea
          placeholder="Announcement content"
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          rows={3}
          style={{ borderRadius: 8, border: '1px solid var(--border)', background: '#121932', color: 'var(--text)', padding: 10 }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr auto', gap: 8 }}>
          <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
          <select value={scheduleRepeat} onChange={(e) => setScheduleRepeat(e.target.value as ScheduleRepeat)}>
            <option value="none">once</option>
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
          </select>
          <button type="button" onClick={addSchedule}>Add schedule</button>
        </div>
        <button type="submit">Create announcement</button>
        {error ? <p className="message error">{error}</p> : null}
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginBottom: 12 }}>
        <article className="kpi-card">
          <h3>예약/반복 발행</h3>
          {schedules.length === 0 ? <p className="kpi-note">등록된 예약이 없습니다.</p> : null}
          {schedules.map((item) => (
            <p className="kpi-note" key={item.id}>
              {item.title} · {new Date(item.at).toLocaleString('ko-KR')} · {item.repeat}
              <button type="button" style={{ marginLeft: 8 }} onClick={() => runSchedule(item)}>Run now</button>
            </p>
          ))}
        </article>
        <article className="kpi-card">
          <h3>발행 이력</h3>
          {history.length === 0 ? <p className="kpi-note">아직 발행 이력이 없습니다.</p> : null}
          {history.map((item) => (
            <p className="kpi-note" key={item.id}>{item.title} · {new Date(item.at).toLocaleString('ko-KR')} · {item.repeat}</p>
          ))}
        </article>
      </div>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Content</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td style={{ maxWidth: 380 }}>{item.content}</td>
              <td>{item.createdAt ? new Date(item.createdAt).toLocaleString('ko-KR') : '-'}</td>
              <td style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => quickEdit(item)}>Edit title</button>
                <button type="button" className="btn-danger" onClick={() => remove(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
