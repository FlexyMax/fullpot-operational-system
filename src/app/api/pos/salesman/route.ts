import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/salesman — returns current user's salesman info
// sp_flower_salesman_uq(@lcunico, @lcuser_uq)
export async function GET(_req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const userId = (session.user as any).id ?? "";
        const r = await executeProcedure("sp_flower_salesman_uq", {
            lcunico:    "%",
            lcuser_uq:  userId,
        });
        return NextResponse.json(r.recordset?.[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
