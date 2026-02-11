const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function getList(path: string) {
  const r = await fetch(`${API}/${path}`, { cache: 'no-store' });
  return r.json();
}

export async function createItem(path: string, body: Record<string, unknown>) {
  const r = await fetch(`${API}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

export async function updateItem(path: string, body: Record<string, unknown>) {
  const r = await fetch(`${API}/${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}
