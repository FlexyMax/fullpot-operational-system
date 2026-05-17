import { NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeQuery(
            `SELECT s.unico, s.subclase, s.sub_sh, c.clase, s.bogo, s.bogo_days, s.bogo_percent
             FROM flower_subclases s
             INNER JOIN flower_clases c ON s.class_uq = c.unico
             WHERE s.unico = '${unico.replace(/'/g,"''")}' `
        );
        return NextResponse.json(r.recordset?.[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const { bogo, bogo_days, bogo_percent } = await req.json();
    try {
        const r = await executeProcedure("sp_flower_subclass_update_bogo", {
            lcunico:       unico,
            llbogo:        bogo        ? 1 : 0,
            lnbogo_days:   bogo_days   ?? 0,
            lnbogo_percent: bogo_percent ?? 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
