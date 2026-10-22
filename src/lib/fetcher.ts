// Client-side JSON helper: throws ApiClientError with the server's Turkish message.

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(url: string, init?: Omit<RequestInit, 'body'> & { body?: unknown }): Promise<T> {
  const { body, headers, ...rest } = init ?? {};
  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiClientError('Bağlantı kurulamadı. İnternet bağlantını kontrol et.', 0, 'NETWORK');
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const payload = (data ?? {}) as { error?: string; code?: string };
    const message =
      payload.error ?? (res.status === 401 ? 'Oturumun sona ermiş. Lütfen tekrar giriş yap.' : 'Bir şeyler ters gitti. Tekrar dener misin?');
    throw new ApiClientError(message, res.status, payload.code, data as Record<string, unknown>);
  }
  return data as T;
}

export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Bir şeyler ters gitti.';
}
