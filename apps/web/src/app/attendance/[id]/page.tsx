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

type Attendance = {
  id: string;
  guildId: string;
};

type Member = {
  id: string;
  nickname: string;
  role: string;
};

export default function AttendanceCheckInsPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<CheckIn[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState('');
  const [status, setStatus] = useState('checked_in');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [checkIns, attendance] = await Promise.all([
      getList(`attendance/${params.id}/check-ins`),
      getList(`attendance/${params.id}`),
    ]);

    setItems(checkIns);

    const memberList = await getList(`members?guildId=${(attendance as Attendance).guildId}`);
    setMembers(memberList);
    if (!memberId && memberList.length > 0) setMemberId(memberList[0].id);
  }, [params.id, memberId]);

  useEffect(() => {
    load().catch((e) => setError((e as Error).message));
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createItem(`attendance/${params.id}/check-ins`, { memberId, status, note });
      setStatus('checked_in');
      setNote('');
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <main>
      <h1>Attendance Check-ins</h1>
      <p>Attendance ID: {params.id}</p>
      <p>
        <Link href="/attendance">← Back to attendance list</Link>
      </p>

      <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 480, marginBottom: 20 }}>
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
          {members.length === 0 ? <option value="">No members available</option> : null}
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.nickname} ({member.role})
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="checked_in">checked_in</option>
          <option value="late">late</option>
          <option value="absent">absent</option>
        </select>
        <input placeholder="note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="submit" disabled={!memberId}>
          Record check-in
        </button>
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
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
