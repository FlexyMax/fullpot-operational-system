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
        await executeQuery(`
            INSERT INTO flower_seasons (unico,season,sh_season,startdate,enddate,activedate,desacdate,publicate,increment,bypercent)
            VALUES('${txt(unico)}','${txt(b.season)}','${txt(b.sh_season)}',
                   ${dt(b.startdate)},${dt(b.enddate)},${dt(b.activedate)},${dt(b.desacdate)},
                   ${bit(b.publicate)},${num(b.increment)},${bit(b.bypercent)})`);
        return NextResponse.json({ success: true, unico });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
