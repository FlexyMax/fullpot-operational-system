import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ uq: string }> }) {
    const { uq } = await params;
    try {
        const r = await executeProcedure("sp_flower_accounts_outcome_uq", { lcunico: uq });
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
