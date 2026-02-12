'use client';

import { useMemo, useState } from 'react';
import { toUserError, updateItem } from '../lib/api';

type Member = {
  id: string;
  guildId: string;
  nickname: string;
  role: string;
  active: boolean;
};

const ROLE_OPTIONS = ['owner', 'admin', 'member'] as const;

export function RbacRoleManager({ initialItems }: { initialItems: Member[] }) {
  const [items, setItems] = useState<Member[]>(initialItems);
  const [guildFilter, setGuildFilter] = useState<'ALL' | string>('ALL');
  const [draftRole, setDraftRole] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const guildOptions = useMemo(() => Array.from(new Set(items.map((item) => item.guildId))).sort(), [items]);

  const filtered = useMemo(
    () => items.filter((item) => (guildFilter === 'ALL' ? true : item.guildId === guildFilter)),
    [items, guildFilter],
  );

  async function saveRole(member: Member) {
    setError('');
    const nextRole = draftRole[member.id] ?? member.role;
    if (nextRole === member.role) return;

    try {
      const updated = await updateItem(`members/${member.id}`, { role: nextRole });
      setItems((prev) => prev.map((item) => (item.id === member.id ? updated : item)));
    } catch (e) {
      setError(toUserError(e));
    }
  }

  return (
    <section>
      <h2>RBAC Role Manager</h2>
      <p className="dashboard-subtitle">길드 단위로 멤버 역할(owner/admin/member)을 조정합니다.</p>
      {error ? <p className="status-warn">{error}</p> : null}

      <div style={{ display: 'flex', gap: 8, margin: '10px 0 14px' }}>
        <select value={guildFilter} onChange={(e) => setGuildFilter(e.target.value)}>
          <option value="ALL">All guilds</option>
          {guildOptions.map((guildId) => (
            <option key={guildId} value={guildId}>
              {guildId}
            </option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nickname</th>
            <th>Guild</th>
            <th>Current role</th>
            <th>Next role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((member) => (
            <tr key={member.id}>
              <td>{member.nickname}</td>
              <td>{member.guildId}</td>
              <td>{member.role}</td>
              <td>
                <select
                  value={draftRole[member.id] ?? member.role}
                  onChange={(e) => setDraftRole((prev) => ({ ...prev, [member.id]: e.target.value }))}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <button onClick={() => saveRole(member)}>Apply role</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
