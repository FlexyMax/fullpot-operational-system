import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
const dt  = (v: any) => v ? `'${String(v).split("T")[0]}'` : "NULL";
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeQuery(`SELECT * FROM flower_seasons WHERE unico='${txt(unico)}'`);
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_seasons_update", {
            lcunico: unico,
            lcseason: txt(b.season),
            lcsh_season: txt(b.sh_season),
            ldstartdate: b.startdate ? b.startdate.split('T')[0] : null,
            ldenddate: b.enddate ? b.enddate.split('T')[0] : null,
            ldactivedate: b.activedate ? b.activedate.split('T')[0] : null,
            lddesacdate: b.desacdate ? b.desacdate.split('T')[0] : null,
            llpublicate: bit(b.publicate),
            lnincrement: num(b.increment),
            llbypercent: bit(b.bypercent)
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_seasons_delete", { lcunico: unico });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Season deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
