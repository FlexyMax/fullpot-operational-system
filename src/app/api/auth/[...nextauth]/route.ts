import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { executeProcedure } from "@/lib/db";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                try {
                    const loginResult = await executeProcedure("sp_flexy_login", {
                        lcUserName: credentials.username,
                        lcPassword: credentials.password,
                    }, true);

                    if (!loginResult.recordset || !loginResult.recordset[0]) return null;
                    const loginData = loginResult.recordset[0];

                    // Minimal hydration to keep cookie size small (prevent 431)
                    const profileResult = await executeProcedure("sp_flower_salesman_uq", {
                        lcunico: '%',
                        lcuser_uq: loginData.unico,
                    });

                    const salesProfile = profileResult.recordset[0] || {};

                    return {
                        id: loginData.unico,
                        username: credentials.username,
                        name: salesProfile.salesman_name || loginData.name,
                        warehouse_uq: salesProfile.wphysical_uq,
                        pax_ip: salesProfile.pax_terminal_ip,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    throw error;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.user = user;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token.user) {
                session.user = token.user as any;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 24 * 60 * 60, // 24 hours
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
