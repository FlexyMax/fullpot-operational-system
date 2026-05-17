import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        // sp_flower_variety_uq may not exist — fall back to direct query for full field set
        const r = await executeQuery(
            `SELECT unico, subcla_uq, class_uq, variety, variety_sh, color_uq,
                    display, changecolor, active, mix, details, expi_days, expo_days,
                    nac_days, variety_oldcode, tolerance
             FROM flower_varieties WHERE unico='${txt(unico)}'`
        );
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    if (!b.variety?.trim())    return NextResponse.json({ success: false, error: "Variety name is empty." }, { status: 400 });
    if (!b.variety_sh?.trim()) return NextResponse.json({ success: false, error: "Variety code is empty." }, { status: 400 });
    try {
        // sp_flower_varieties_update (verified 2026-05-16):
        // @lcunico, @lccode, @lcvariety, @lccolor_uq, @lnexpiration, @lnlocal,
        // @lldisplay, @llchangecolor, @lcnotes, @lcold_code, @lcsubclass_uq, @lntolerance, @llmix, @llactive
        const r = await executeProcedure("sp_flower_varieties_update", {
            lcunico:       unico,
            lccode:        (b.variety_sh || "").substring(0, 4),
            lcvariety:     b.variety,
            lccolor_uq:    b.color_uq    || "",
            lnexpiration:  b.expi_days   ?? 0,
            lnlocal:       b.nac_days    ?? 0,
            lldisplay:     b.display     ? 1 : 0,
            llchangecolor: b.changecolor ? 1 : 0,
            lcnotes:       b.details     || b.notes || "",
            lcold_code:    b.variety_oldcode || b.old_code || "",
            lcsubclass_uq: b.subcla_uq   || b.subclass_uq || "",
            lntolerance:   b.tolerance   ?? 0,
            llmix:         b.mix         ? 1 : 0,
            llactive:      b.active      ? 1 : 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: "Variety updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_varieties_delete", { lcunico: unico });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: "Variety deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
