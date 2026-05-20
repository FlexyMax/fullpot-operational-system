import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ awbcode: string }> }) {
    const { awbcode } = await params;
    try {
        const r = await executeProcedure("sp_flower_awbs_varieties", { lnawbcode: awbcode });
        return NextResponse.json({ records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
