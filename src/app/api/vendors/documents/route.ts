import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const grower_uq = req.nextUrl.searchParams.get("grower_uq") || "";
    try {
        const r = await executeProcedure("sp_flower_growers_documents", {
            lcgrower_uq: grower_uq,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_growers_documents_insert", {
            lcgrower_uq: String(b.grower_uq ?? ""),
            lcdocument:  String(b.document ?? ""),
            ldfrom:      new Date(b.date_from),
            ldto:        new Date(b.date_to),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? row?.UNICO });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
