import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);

// GET /api/inventory-entry/awb-setup?search=XXX
export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") || "";
    try {
        const r = await executeProcedure("sp_flower_awb_setup_search", { lcsearch: search });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST /api/inventory-entry/awb-setup
export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_awbs_setup_insert", {
            lcawbcode:  str(b.awbcode,  11),
            ldawbdate:  b.awbdate ? new Date(b.awbdate) : new Date(),
            lccity_uq:  str(b.city_uq,   8),
            lcuser_uq:  str(b.user_uq,   8),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        const unico = row?.UNICO ?? row?.unico ?? null;
        return NextResponse.json({ success: true, unico });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
