import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';
import { auth } from './auth';
import { prisma } from './db';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public extra?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export const unauthorized = () => new ApiError(401, 'Bu işlem için giriş yapmalısın.', 'UNAUTHORIZED');
export const forbidden = (message = 'Bu işlem için yetkin yok.') => new ApiError(403, message, 'FORBIDDEN');
export const notFound = (message = 'Bulunamadı.') => new ApiError(404, message, 'NOT_FOUND');
export const badRequest = (message: string, code = 'BAD_REQUEST') => new ApiError(400, message, code);

type Handler<Ctx> = (req: Request, ctx: Ctx) => Promise<Response>;

/** Wraps a route handler with uniform JSON error responses. */
export function route<Ctx = unknown>(handler: Handler<Ctx>): Handler<Ctx> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message, code: error.code, ...error.extra },
          { status: error.status },
        );
      }
      if (error instanceof ZodError) {
        const first = error.issues[0];
        return NextResponse.json(
          { error: first?.message || 'Geçersiz istek.', code: 'VALIDATION', issues: error.issues },
          { status: 400 },
        );
      }
      console.error(`[api] ${req.method} ${new URL(req.url).pathname}`, error);
      return NextResponse.json({ error: 'Beklenmeyen bir hata oluştu. Lütfen tekrar dene.' }, { status: 500 });
    }
  };
}

export async function readJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw badRequest('İstek gövdesi okunamadı.');
  }
  return schema.parse(body);
}

export async function requireApiUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw unauthorized();
  return id;
}

export async function requireApiAdminId(): Promise<string> {
  const id = await requireApiUserId();
  const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (user?.role !== 'ADMIN') throw forbidden();
  return id;
}

export function json<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
