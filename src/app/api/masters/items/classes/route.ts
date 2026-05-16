import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") || "%";
    const param  = search.includes("%") ? search : `%${search}%`;
    try {
        const r = await executeProcedure("sp_flower_class_list", { lcclass: param });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
    const bit = (v: any) => (v ? 1 : 0);
    const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
    const int = (v: any) => { const n = parseInt(String(v||0)); return isNaN(n) ? 0 : n; };
    try {
        const r = await executeProcedure("sp_flower_class_insert", {
            lccode:           txt(b.class_sh),
            lcclass:          txt(b.clase),
            lcnandina:        txt(b.nandina || ""),
            lctarifno:        txt(b.tarifno || ""),
            lldisplay:        bit(b.display),
            lcnotes:          txt(b.notes || ""),
            lcinv_account_uq: txt(b.inv_account_uq || ""),
            lcadj_account_uq: txt(b.adj_account_uq || ""),
            lcsal_account_uq: txt(b.sal_account_uq || ""),
            llisflower:       bit(b.isflower !== false),
            lnweight_fbox:    num(b.weight_fbox || 0),
            lnatpda_tax:      num(b.atpda_tax || 0),
            lnstems_bunch:    int(b.stems_bunch || 0),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message || "Class created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
