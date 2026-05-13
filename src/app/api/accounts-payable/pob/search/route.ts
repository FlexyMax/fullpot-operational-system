import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const po_no = req.nextUrl.searchParams.get("po_no");
    if (!po_no) return NextResponse.json({ error: "po_no required" }, { status: 400 });
    const poInt = parseInt(po_no);
    if (isNaN(poInt)) return NextResponse.json({ error: "po_no must be a number" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_flower_pob_search_no", { lnporder_no: poInt });
        return NextResponse.json(result.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
