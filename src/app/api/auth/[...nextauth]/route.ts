import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { executeProcedure } from "@/lib/db";
import { consumePreAuth } from "@/lib/authCodes";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username:     { label: "Username",       type: "text" },
                preAuthToken: { label: "Pre-Auth Token", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.preAuthToken) return null;

                // Consume the one-time pre-auth token issued by /api/auth/verify-code
                const preAuth = consumePreAuth(credentials.username, credentials.preAuthToken);
                if (!preAuth) return null;

                try {
                    // Minimal hydration to keep cookie size small (prevent 431)
                    const profileResult = await executeProcedure("sp_flower_salesman_uq", {
                        lcunico:   '%',
                        lcuser_uq: preAuth.unico,
                    });

                    const salesProfile = profileResult.recordset[0] || {};

                    // Get user nivel for SUPERADMIN checks
                    let nivel = "";
                    try {
                        const infoResult = await executeProcedure("sp_NC_User_Info", { lcUser_uq: preAuth.unico }, true);
                        nivel = String(infoResult.recordset?.[0]?.level ?? "").trim().toUpperCase();
                    } catch { /* nivel stays "" */ }

                    return {
                        id:           preAuth.unico,
                        username:     credentials.username,
                        name:         salesProfile.salesman_name || preAuth.name,
                        warehouse_uq: salesProfile.wphysical_uq,
                        pax_ip:       salesProfile.pax_terminal_ip,
                        nivel,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
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
