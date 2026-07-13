import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const r = await executeProcedure("sp_flower_real_inventory_totals", {});
        return NextResponse.json(r.recordset?.[0] ?? {});
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
