const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function parseOrThrow(r: Response) {
  const payload = await r.json().catch(() => ({}));
  if (!r.ok) {
    const message = (payload as any)?.message;
    const text = Array.isArray(message) ? message.join(', ') : message || `Request failed (${r.status})`;
    throw new Error(text);
  }

  return payload;
}

export async function getList(path: string) {
  const r = await fetch(`${API}/${path}`, { cache: 'no-store' });
  return parseOrThrow(r);
}

export async function createItem(path: string, body: Record<string, unknown>) {
  const r = await fetch(`${API}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseOrThrow(r);
}

export async function updateItem(path: string, body: Record<string, unknown>) {
  const r = await fetch(`${API}/${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseOrThrow(r);
}
