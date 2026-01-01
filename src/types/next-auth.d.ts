import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            xp?: number;
            level?: number;
            streak?: number;
        } & DefaultSession["user"];
    }
}
