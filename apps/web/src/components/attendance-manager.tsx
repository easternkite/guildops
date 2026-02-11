'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { createItem } from '../lib/api';

type Attendance = {
  id: string;
  guildId: string;
  game: string;
  title: string;
  startsAt: string;
  status: string;
  checkInCount?: number;
};

export function AttendanceManager({ initialItems }: { initialItems: Attendance[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState({ guildId: '', game: '', title: '', startsAt: '' });

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
    [items],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const created = await createItem('attendance', {
      guildId: form.guildId,
      game: form.game,
      title: form.title,
      startsAt: form.startsAt,
      status: 'open',
    });

    setItems((prev) => [created, ...prev]);
    setForm({ guildId: '', game: '', title: '', startsAt: '' });
  }

  return (
    <section>
      <h2>Attendance Management</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 480, marginBottom: 20 }}>
        <input placeholder="Guild ID" value={form.guildId} onChange={(e) => setForm((p) => ({ ...p, guildId: e.target.value }))} required />
        <input placeholder="Game (e.g. LostArk)" value={form.game} onChange={(e) => setForm((p) => ({ ...p, game: e.target.value }))} required />
        <input placeholder="Attendance title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
        <input type="datetime-local" value={form.startsAt} onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value }))} required />
        <button type="submit">Create attendance</button>
      </form>

      <ul style={{ display: 'grid', gap: 10, paddingLeft: 16 }}>
        {sortedItems.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong> ({item.game}) · {new Date(item.startsAt).toLocaleString()} · check-ins: {item.checkInCount ?? 0}{' '}
            <Link href={`/attendance/${item.id}`}>View check-ins</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
