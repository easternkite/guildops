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

export function MembersManager({ initialItems }: { initialItems: Member[] }) {
  const [items, setItems] = useState<Member[]>(initialItems);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | string>('ALL');
  const [error, setError] = useState('');

  const roleOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.role))).sort(),
    [items],
  );

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((item) => {
      if (roleFilter !== 'ALL' && item.role !== roleFilter) return false;
      if (!keyword) return true;
      return item.nickname.toLowerCase().includes(keyword) || item.id.toLowerCase().includes(keyword);
    });
  }, [items, query, roleFilter]);

  async function toggleActive(member: Member) {
    setError('');
    try {
      const updated = await updateItem(`members/${member.id}`, { active: !member.active });
      setItems((prev) => prev.map((item) => (item.id === member.id ? updated : item)));
    } catch (e) {
      setError(toUserError(e));
    }
  }

  return (
    <section>
      <h2>Members</h2>
      <p className="dashboard-subtitle">테이블/검색/역할 필터/active 토글</p>

      {error ? <p className="message error">{error}</p> : null}

      <div style={{ display: 'flex', gap: 8, margin: '10px 0 14px' }}>
        <input
          placeholder="닉네임 또는 member id 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="ALL">All roles</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nickname</th>
            <th>Role</th>
            <th>Guild</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((member) => (
            <tr key={member.id}>
              <td>{member.nickname}</td>
              <td>{member.role}</td>
              <td>{member.guildId}</td>
              <td>{member.active ? 'active' : 'inactive'}</td>
              <td>
                <button onClick={() => toggleActive(member)}>{member.active ? 'Deactivate' : 'Activate'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
