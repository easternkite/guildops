'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { createItem, getList } from '../../../lib/api';

type CheckIn = {
  id: string;
  memberId: string;
  status: string;
  note?: string;
  checkedInAt: string;
};

export default function AttendanceCheckInsPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<CheckIn[]>([]);
  const [memberId, setMemberId] = useState('');
  const [status, setStatus] = useState('checked_in');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const data = await getList(`attendance/${params.id}/check-ins`).catch(() => []);
    setItems(data);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await createItem(`attendance/${params.id}/check-ins`, { memberId, status, note });
    setMemberId('');
    setStatus('checked_in');
    setNote('');
    await load();
  }

  return (
    <main>
      <h1>Attendance Check-ins</h1>
      <p>Attendance ID: {params.id}</p>
      <p>
        <Link href="/attendance">← Back to attendance list</Link>
      </p>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 480, marginBottom: 20 }}>
        <input placeholder="Member ID" value={memberId} onChange={(e) => setMemberId(e.target.value)} required />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="checked_in">checked_in</option>
          <option value="late">late</option>
          <option value="absent">absent</option>
        </select>
        <input placeholder="note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="submit">Record check-in</button>
      </form>

      <ul style={{ display: 'grid', gap: 10, paddingLeft: 16 }}>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.memberId}</strong> · {item.status} · {new Date(item.checkedInAt).toLocaleString()}
            {item.note ? ` · ${item.note}` : ''}
          </li>
        ))}
      </ul>
    </main>
  );
}
