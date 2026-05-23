import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// POST { unico, approved: true|false }
export async function POST(req: NextRequest) {
    const body = await req.json();
    const { unico, approved } = body;
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_approve_cost", {
            lcunico:    unico,
            llapproved: approved ? 1 : 0,
        });
        return NextResponse.json({ success: true, data: r.recordset[0] ?? null });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
