import 'server-only';
import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from './db';

export const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(200),
});

const providers: NextAuthConfig['providers'] = [
  Credentials({
    credentials: {
      email: { label: 'E-posta', type: 'email' },
      password: { label: 'Şifre', type: 'password' },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } },
        select: { id: true, email: true, name: true, image: true, password: true },
      });
      if (!user?.password) return null;

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;

      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
];

if (googleEnabled) {
  providers.push(
    Google({
      // Google verifies e-mail ownership, so linking to an existing account by e-mail is safe.
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login', error: '/login' },
  trustHost: true,
  providers,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user?.id) token.id = user.id;
      // Profile edits push the new name/avatar into the token via useSession().update()
      if (trigger === 'update' && session && typeof session === 'object') {
        const next = session as { name?: unknown; image?: unknown };
        if (typeof next.name === 'string') token.name = next.name;
        if (typeof next.image === 'string' || next.image === null) token.picture = next.image as string | null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
