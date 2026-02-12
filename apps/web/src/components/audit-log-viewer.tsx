'use client';

import { useMemo, useState } from 'react';

type AuditLog = {
  id: string;
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
};

export function AuditLogViewer({ initialItems }: { initialItems: AuditLog[] }) {
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'ALL' | string>('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(initialItems[0]?.id ?? null);

  const actionOptions = useMemo(
    () => Array.from(new Set(initialItems.map((item) => item.action))).sort(),
    [initialItems],
  );

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return initialItems.filter((item) => {
      if (actionFilter !== 'ALL' && item.action !== actionFilter) return false;
      if (!keyword) return true;
      return [item.actor, item.action, item.targetType, item.targetId, item.id].some((value) =>
        value.toLowerCase().includes(keyword),
      );
    });
  }, [initialItems, query, actionFilter]);

  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  return (
    <section>
      <h2>Audit Logs</h2>
      <p className="dashboard-subtitle">변경 이력 필터/검색/상세 확인</p>

      <div style={{ display: 'flex', gap: 8, margin: '10px 0 14px' }}>
        <input
          placeholder="actor/action/target/id 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="ALL">All actions</option>
          {actionOptions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12 }}>
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} onClick={() => setSelectedId(log.id)} style={{ cursor: 'pointer' }}>
                <td>{new Date(log.createdAt).toLocaleString('ko-KR')}</td>
                <td>{log.actor}</td>
                <td>{log.action}</td>
                <td>{log.targetType}:{log.targetId}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <article className="kpi-card" style={{ minHeight: 220 }}>
          <h3>상세</h3>
          {selected ? (
            <>
              <p className="kpi-note"><strong>ID</strong> {selected.id}</p>
              <p className="kpi-note"><strong>Actor</strong> {selected.actor}</p>
              <p className="kpi-note"><strong>Action</strong> {selected.action}</p>
              <p className="kpi-note"><strong>Target</strong> {selected.targetType}:{selected.targetId}</p>
              <p className="kpi-note"><strong>Created</strong> {new Date(selected.createdAt).toLocaleString('ko-KR')}</p>
            </>
          ) : (
            <p className="kpi-note">표시할 로그가 없습니다.</p>
          )}
        </article>
      </div>
    </section>
  );
}
