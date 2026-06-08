import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";
import crypto from "crypto";

const txt    = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit    = (v: any) => (v ? 1 : 0);
const num    = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
const genUq  = () => crypto.randomBytes(4).toString("hex").toUpperCase();
const dt     = (v: any) => v ? `'${String(v).split("T")[0]}'` : "NULL";

export async function GET(req: NextRequest) {
    const search = req.nextUrl.searchParams.get("search") || "%";
    try {
        const r = await executeProcedure("sp_flower_seasons_list", { lcseason: search.includes("%") ? search : `%${search}%` });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    const unico = genUq();
    try {
        const r = await executeProcedure("sp_flower_seasons_insert", {
            lcseason: txt(b.season),
            lcsh_season: txt(b.sh_season),
            ldstartdate: b.startdate ? String(b.startdate).split("T")[0] : null,
            ldenddate: b.enddate ? String(b.enddate).split("T")[0] : null,
            ldactivedate: b.activedate ? String(b.activedate).split("T")[0] : null,
            lddesacdate: b.desacdate ? String(b.desacdate).split("T")[0] : null,
            llpublicate: bit(b.publicate),
            lnincrement: num(b.increment),
            llbypercent: bit(b.bypercent)
        });
        const row = r.recordset?.[0] || {};
        if (row.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row.unico || row.Unico || unico });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
