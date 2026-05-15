import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

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
        await executeQuery(`
            UPDATE flower_seasons SET season='${txt(b.season)}',sh_season='${txt(b.sh_season)}',
                startdate=${dt(b.startdate)},enddate=${dt(b.enddate)},activedate=${dt(b.activedate)},
                desacdate=${dt(b.desacdate)},publicate=${bit(b.publicate)},increment=${num(b.increment)},bypercent=${bit(b.bypercent)}
            WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        await executeQuery(`DELETE FROM flower_seasons WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
