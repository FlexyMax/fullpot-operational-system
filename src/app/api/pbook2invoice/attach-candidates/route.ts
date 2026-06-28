import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const pbook_uq = req.nextUrl.searchParams.get("pbook_uq") || "";
    if (!pbook_uq) return NextResponse.json([]);
    try {
        const r = await executeProcedure("sp_flower_prebook_invoices_to_attach", { lcpbook_uq: pbook_uq });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
