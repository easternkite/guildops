'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  active: boolean;
};

export default function AttendanceCheckInsPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState<CheckIn[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberId, setMemberId] = useState('');
  const [status, setStatus] = useState('checked_in');
  const [note, setNote] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | string>('ALL');
  const [activeOnly, setActiveOnly] = useState(true);
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

  const roleOptions = useMemo(
    () => Array.from(new Set(members.map((member) => member.role))).sort(),
    [members],
  );

  const checkInByMemberId = useMemo(() => new Map(items.map((item) => [item.memberId, item])), [items]);

  const selectedCheckIn = memberId ? checkInByMemberId.get(memberId) : undefined;

  const filteredMembers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return members.filter((member) => {
      if (activeOnly && !member.active) return false;
      if (roleFilter !== 'ALL' && member.role !== roleFilter) return false;
      if (!keyword) return true;
      return member.nickname.toLowerCase().includes(keyword) || member.id.toLowerCase().includes(keyword);
    });
  }, [members, query, roleFilter, activeOnly]);

  useEffect(() => {
    if (!filteredMembers.some((member) => member.id === memberId)) {
      setMemberId(filteredMembers[0]?.id ?? '');
    }
  }, [filteredMembers, memberId]);

  const normalizedNote = note.trim();
  const isDuplicateUpdate =
    !!selectedCheckIn &&
    selectedCheckIn.status === status &&
    (selectedCheckIn.note?.trim() ?? '') === normalizedNote;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (isDuplicateUpdate) {
      setError('이미 동일한 체크인 상태입니다. 상태/메모를 변경해 주세요.');
      return;
    }
    try {
      await createItem(`attendance/${params.id}/check-ins`, { memberId, status, note: normalizedNote || undefined });
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
        <input
          placeholder="Search member by nickname or id"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">All roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} />
            active only
          </label>
        </div>

        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} required>
          {filteredMembers.length === 0 ? <option value="">No members available</option> : null}
          {filteredMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.nickname} ({member.role}){member.active ? '' : ' · inactive'}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="checked_in">checked_in</option>
          <option value="late">late</option>
          <option value="absent">absent</option>
        </select>
        <input placeholder="note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        {selectedCheckIn ? (
          <p style={{ color: '#9fb0da', margin: 0 }}>
            기존 체크인: <strong>{selectedCheckIn.status}</strong>
            {selectedCheckIn.note ? ` · ${selectedCheckIn.note}` : ''}
          </p>
        ) : null}
        <button type="submit" disabled={!memberId || isDuplicateUpdate}>
          {selectedCheckIn ? 'Update check-in' : 'Record check-in'}
        </button>
        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      </form>

      <ul style={{ display: 'grid', gap: 10, paddingLeft: 16 }}>
        {items.map((item) => {
          const member = members.find((m) => m.id === item.memberId);
          return (
            <li key={item.id}>
              <strong>{member ? member.nickname : item.memberId}</strong> · {item.status} ·{' '}
              {new Date(item.checkedInAt).toLocaleString()}
              {item.note ? ` · ${item.note}` : ''}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
