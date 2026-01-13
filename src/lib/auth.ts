import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET || "vocabmaster-dev-secret-key-2026",
    debug: process.env.NODE_ENV === "development",
    providers: [
        Credentials({
            name: "Giriş Yap",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Şifre", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const email = credentials?.email as string;
                    const password = credentials?.password as string;

                    if (!email || !password) {
                        return null;
                    }

                    // Find user
                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (!user) {
                        return null; // Register required
                    }

                    // Verify password
                    if (!user.password) {
                        return null; // User must have password
                    }

                    const isValid = await bcrypt.compare(password, user.password);
                    if (!isValid) return null;

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id && session.user) {
                session.user.id = token.id as string;

                // Fetch user data including name and image for profile updates
                try {
                    const dbUser = await prisma.user.findUnique({
                        where: { id: token.id as string },
                        select: { name: true, image: true, xp: true, level: true, streak: true },
                    });

                    if (dbUser) {
                        // Update name and image from database (for profile edits)
                        if (dbUser.name) session.user.name = dbUser.name;
                        if (dbUser.image) session.user.image = dbUser.image;
                        session.user.xp = dbUser.xp;
                        session.user.level = dbUser.level;
                        session.user.streak = dbUser.streak;
                    }
                } catch {
                    // Ignore database errors in session callback
                }
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: "/login",
    },
    trustHost: true,
});
