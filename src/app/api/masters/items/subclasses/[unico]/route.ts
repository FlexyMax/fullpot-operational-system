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
        const r = await executeQuery(`SELECT * FROM flower_subclases WHERE unico='${txt(unico)}'`);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_subclass_update", {
            lcunico:      unico,
            lccode:       txt(b.sub_sh),
            lcarmellini:  txt(b.armellini || ""),
            lcsubclass:   txt(b.subclase),
            lnexpiration: int(b.expiration || 0),
            lnlocal:      int(b.local || 0),
            lldisplay:    bit(b.display),
            lcnotes:      txt(b.notes || ""),
            lcnandina:    txt(b.nandina || ""),
            lctarifno:    txt(b.tarifno || ""),
            lcgrade_uq:   txt(b.grade_uq || ""),
            lnatpda:      num(b.atpda_tax || 0),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Subclass updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_subclass_delete", { lcunico: unico });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Subclass deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
