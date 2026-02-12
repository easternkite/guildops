'use client';

import { useMemo, useState } from 'react';
import { createItem, toUserError } from '../lib/api';

type InviteStatus = 'pending' | 'approved' | 'rejected' | 'expired';

type InviteItem = {
  id: string;
  code: string;
  guildId: string;
  nickname: string;
  role: 'member' | 'admin';
  expiresAt: string;
  status: InviteStatus;
  createdAt: string;
};

const KEY = 'guildops-invite-flow-v1';

function loadInvites(): InviteItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as InviteItem[];
  } catch {
    return [];
  }
}

function saveInvites(next: InviteItem[]) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function InviteOnboardingManager() {
  const [guildId, setGuildId] = useState('guild-demo');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [hours, setHours] = useState('24');
  const [invites, setInvites] = useState<InviteItem[]>(loadInvites);
  const [error, setError] = useState('');

  const normalized = useMemo(() => {
    const now = Date.now();
    const next = invites.map((item) => {
      if (item.status === 'pending' && new Date(item.expiresAt).getTime() < now) {
        return { ...item, status: 'expired' as InviteStatus };
      }
      return item;
    });

    if (next.some((item, idx) => item.status !== invites[idx]?.status)) {
      setInvites(next);
      saveInvites(next);
    }

    return next;
  }, [invites]);

  function createInvite() {
    setError('');
    if (!nickname.trim()) {
      setError('닉네임을 입력해 주세요.');
      return;
    }

    const expireHours = Math.max(1, Number(hours) || 24);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expireHours * 60 * 60 * 1000).toISOString();
    const code = Math.random().toString(36).slice(2, 10).toUpperCase();
    const invite: InviteItem = {
      id: crypto.randomUUID(),
      code,
      guildId: guildId.trim() || 'guild-demo',
      nickname: nickname.trim(),
      role,
      expiresAt,
      status: 'pending',
      createdAt: now.toISOString(),
    };

    const next = [invite, ...normalized];
    setInvites(next);
    saveInvites(next);
    setNickname('');
  }

  async function approve(invite: InviteItem) {
    setError('');
    try {
      await createItem('members', {
        guildId: invite.guildId,
        nickname: invite.nickname,
        role: invite.role,
        active: true,
      });
      const next = normalized.map((item) => (item.id === invite.id ? { ...item, status: 'approved' as InviteStatus } : item));
      setInvites(next);
      saveInvites(next);
    } catch (e) {
      setError(toUserError(e));
    }
  }

  function reject(invite: InviteItem) {
    const next = normalized.map((item) => (item.id === invite.id ? { ...item, status: 'rejected' as InviteStatus } : item));
    setInvites(next);
    saveInvites(next);
  }

  return (
    <section>
      <h2>Invite & Onboarding</h2>
      <p className="dashboard-subtitle">초대 링크 생성 → 가입 승인/거절 → 멤버 등록</p>
      {error ? <p className="status-warn">{error}</p> : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr auto', gap: 8, margin: '10px 0 14px' }}>
        <input value={guildId} onChange={(e) => setGuildId(e.target.value)} placeholder="guild id" />
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="nickname" />
        <select value={role} onChange={(e) => setRole(e.target.value as 'member' | 'admin')}>
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
        <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="만료(시간)" />
        <button type="button" onClick={createInvite}>Create invite</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Invite</th>
            <th>Guild</th>
            <th>Nickname</th>
            <th>Role</th>
            <th>Expires</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {normalized.map((item) => (
            <tr key={item.id}>
              <td><code>{item.code}</code></td>
              <td>{item.guildId}</td>
              <td>{item.nickname}</td>
              <td>{item.role}</td>
              <td>{new Date(item.expiresAt).toLocaleString('ko-KR')}</td>
              <td>{item.status}</td>
              <td style={{ display: 'flex', gap: 6 }}>
                <button disabled={item.status !== 'pending'} onClick={() => approve(item)}>Approve</button>
                <button disabled={item.status !== 'pending'} className="btn-danger" onClick={() => reject(item)}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
