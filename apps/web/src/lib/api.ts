const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseOrThrow(r: Response) {
  const payload = await r.json().catch(() => ({}));
  if (!r.ok) {
    const message = (payload as { message?: string | string[] })?.message;
    const text = Array.isArray(message) ? message.join(', ') : message || `Request failed (${r.status})`;
    throw new ApiError(text, r.status, payload);
  }

  return payload;
}

function buildPermissionGuide(status: number) {
  if (status === 401) {
    return '로그인이 만료되었거나 인증 정보가 없습니다. 다시 로그인한 뒤 시도해 주세요.';
  }

  if (status === 403) {
    return '현재 역할로는 이 작업 권한이 없습니다. Owner/Admin 권한 계정으로 다시 시도해 주세요.';
  }

  return null;
}

export function toUserError(error: unknown) {
  if (error instanceof ApiError) {
    const guide = buildPermissionGuide(error.status);
    return guide ? `${error.message} · ${guide}` : error.message;
  }

  return (error as Error).message;
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

export async function deleteItem(path: string) {
  const r = await fetch(`${API}/${path}`, { method: 'DELETE' });
  return parseOrThrow(r);
}
