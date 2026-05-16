import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v||0)); return isNaN(n) ? 0 : n; };
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeQuery(`SELECT * FROM flower_clases WHERE unico='${txt(unico)}'`);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_class_update", {
            lcunico:          unico,
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
        return NextResponse.json({ success: true, message: row?.Message || "Class updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_class_delete", { lcunico: unico });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Class deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
