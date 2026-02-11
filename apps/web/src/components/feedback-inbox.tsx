'use client';

import { useMemo, useState } from 'react';

type FeedbackItem = {
  id: string;
  path: string;
  message: string;
  createdAt: string;
};

const STORAGE_KEY = 'guildops-feedback-v1';

function loadItems(): FeedbackItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as FeedbackItem[];
    return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export function FeedbackInbox() {
  const [items, setItems] = useState<FeedbackItem[]>(loadItems);
  const [pathFilter, setPathFilter] = useState('ALL');

  const pathOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(items.map((item) => item.path))).sort()],
    [items],
  );

  const filtered = useMemo(
    () => (pathFilter === 'ALL' ? items : items.filter((item) => item.path === pathFilter)),
    [items, pathFilter],
  );

  function removeOne(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function clearAll() {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <section>
      <h2>Feedback Inbox</h2>
      <p className="dashboard-subtitle">localStorage feedback 조회/필터/삭제</p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <select value={pathFilter} onChange={(e) => setPathFilter(e.target.value)}>
          {pathOptions.map((path) => (
            <option key={path} value={path}>
              {path}
            </option>
          ))}
        </select>
        <button type="button" className="btn-danger" onClick={clearAll} disabled={items.length === 0}>
          Clear all
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Created</th>
            <th>Path</th>
            <th>Message</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={item.id}>
              <td>{new Date(item.createdAt).toLocaleString('ko-KR')}</td>
              <td>{item.path}</td>
              <td>{item.message}</td>
              <td>
                <button type="button" className="btn-danger" onClick={() => removeOne(item.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ color: 'var(--muted)' }}>
                저장된 피드백이 없습니다.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </section>
  );
}
