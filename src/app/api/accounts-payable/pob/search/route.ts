import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const po_no = req.nextUrl.searchParams.get("po_no");
    if (!po_no) return NextResponse.json({ error: "po_no required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_flower_pob_search_no", [
            { name: "po_no", value: po_no }
        ]);
        return NextResponse.json(result.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
