import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const no = req.nextUrl.searchParams.get("no");
    if (!no) return NextResponse.json({ error: "PO no required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_pob_search_no", { lnporder_no: parseInt(no, 10) }); // verified: @lnporder_no(int) — NOT lnpo
        const row = r.recordset?.[0] ?? null;
        if (!row) return NextResponse.json(null);
        const normalized = Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]));
        return NextResponse.json(normalized);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

