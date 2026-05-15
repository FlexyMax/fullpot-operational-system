import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };

export async function GET(req: NextRequest) {
    const wh = req.nextUrl.searchParams.get("warehouse") || "";
    if (!wh) return NextResponse.json([]);
    try {
        const r = await executeProcedure("sp_flower_warehouses_physical_freights", { lcwphysical_uq: wh });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_warehouses_physical_freights_insert2", {
            lcwphysical_uq: txt(b.wphysical_uq),
            lcseason_uq:    txt(b.season_uq),
            lccity_uq:      txt(b.city_uq),
            lnfreight:      num(b.freight),
            lnfreight_kg:   num(b.freight_kg),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message || "Rate created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
