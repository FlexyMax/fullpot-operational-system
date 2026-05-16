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
        const r = await executeQuery(`SELECT * FROM flower_cases WHERE unico='${txt(unico)}'`);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_cases_update", {
            lcunico:          unico,
            lccase_sh:        txt(b.case_sh),
            lldisplay:        bit(b.display),
            lccase_name:      txt(b.case_name),
            lncase_long:      num(b.case_long || 0),
            lncase_wide:      num(b.case_wide || 0),
            lncase_high:      num(b.case_high || 0),
            lnweight:         num(b.weight || 0),
            lncubic_feet:     num(b.cubic_feet || 0),
            lncharges:        num(b.charges || 0),
            lnfactor:         num(b.factor || 0),
            lncharges_factor: num(b.charges_factor || 0),
            lncases_pallet:   int(b.cases_pallet || 0),
            lcold_code:       txt(b.fboxcode || ""),
            lcboxtype:        txt(b.boxtype || ""),
            lcarmellini_code: txt(b.armellini_code || ""),
            lncase_cost:      num(b.case_cost || 0),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Case updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_cases_delete", { lccase_uq: unico });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Case deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
