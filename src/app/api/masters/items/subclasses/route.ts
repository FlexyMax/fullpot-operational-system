import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v||0)); return isNaN(n) ? 0 : n; };

export async function GET(req: NextRequest) {
    const class_uq = req.nextUrl.searchParams.get("class_uq") || "";
    const search   = req.nextUrl.searchParams.get("search") || "%";
    const param    = search.includes("%") ? search : `%${search}%`;
    try {
        const r = await executeProcedure("sp_flower_class_subclass", {
            lcclass_uq: class_uq,
            lcsubclass:  param,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_subclass_insert", {
            lcclass_uq:    txt(b.clase_uq || b.class_uq),
            lccode:        txt(b.sub_sh),
            lcarmellini:   txt(b.armellini || ""),
            lcsubclass:    txt(b.subclase),
            lnexpiration:  int(b.expiration || 0),
            lnlocal:       int(b.local || 0),
            lldisplay:     bit(b.display),
            lcnotes:       txt(b.notes || ""),
            lcnandina:     txt(b.nandina || ""),
            lctarifno:     txt(b.tarifno || ""),
            lcgrade_uq:    txt(b.grade_uq || ""),
            lnatpda:       num(b.atpda_tax || 0),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message || "Subclass created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
