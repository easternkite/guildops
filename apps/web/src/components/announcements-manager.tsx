'use client';

import { useMemo, useState } from 'react';
import { createItem, updateItem } from '../lib/api';

type Announcement = {
  id: string;
  guildId: string;
  title: string;
  content: string;
  createdAt?: string;
};

const defaultForm = { guildId: '', title: '', content: '' };
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export function AnnouncementsManager({ initialItems }: { initialItems: Announcement[] }) {
  const [items, setItems] = useState<Announcement[]>(initialItems);
  const [form, setForm] = useState(defaultForm);
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
      setError((e as Error).message);
    }
  }

  async function quickEdit(item: Announcement) {
    const nextTitle = prompt('새 공지 제목', item.title);
    if (!nextTitle) return;
    const updated = await updateItem(`announcements/${item.id}`, { title: nextTitle });
    setItems((prev) => prev.map((ann) => (ann.id === item.id ? updated : ann)));
  }

  async function remove(id: string) {
    await fetch(`${API}/announcements/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <section>
      <h2>Announcements</h2>
      <p className="dashboard-subtitle">공지 목록/생성/수정/삭제 + 사용자 피드백</p>

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
        <button type="submit">Create announcement</button>
        {error ? <p className="message error">{error}</p> : null}
      </form>

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
