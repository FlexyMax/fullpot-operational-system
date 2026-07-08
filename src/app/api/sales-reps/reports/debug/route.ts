import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const sp      = req.nextUrl.searchParams;
    const lcunico = sp.get("lcunico") ?? "%";

    try {
        const r = await executeProcedure("sp_flower_customers_by_salesman_report", { lcsalesman_uq: lcunico });
        return NextResponse.json({ ok: true, rows: r.recordset?.length ?? 0, sample: r.recordset?.[0] ?? null });
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
}
