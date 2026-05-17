import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const subclass_uq = req.nextUrl.searchParams.get("subclass_uq") || "";
    const search      = req.nextUrl.searchParams.get("search") || "%";
    const param       = search.includes("%") ? search : `%${search}%`;
    try {
        const r = await executeProcedure("sp_flower_subclass_varieties", {
            lcsubclass_uq: subclass_uq,
            lcvariety:     param,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    if (!b.variety?.trim())    return NextResponse.json({ success: false, error: "Variety name is empty." }, { status: 400 });
    if (!b.variety_sh?.trim()) return NextResponse.json({ success: false, error: "Variety code is empty." }, { status: 400 });
    if (!b.subcla_uq && !b.subclass_uq) return NextResponse.json({ success: false, error: "Subclass is empty." }, { status: 400 });
    try {
        // sp_flower_varieties_insert (verified 2026-05-16):
        // @lcsubclass_uq, @lccode, @lcvariety, @lccolor_uq, @lnexpiration, @lnlocal,
        // @lldisplay, @llchangecolor, @lcnotes, @lcold_code, @lntolerance, @llmix
        const r = await executeProcedure("sp_flower_varieties_insert", {
            lcsubclass_uq: b.subcla_uq || b.subclass_uq,
            lccode:        (b.variety_sh || "").substring(0, 4),
            lcvariety:     b.variety,
            lccolor_uq:    b.color_uq   || "",
            lnexpiration:  b.expi_days  ?? 0,
            lnlocal:       b.nac_days   ?? 0,
            lldisplay:     b.display    ? 1 : 0,
            llchangecolor: b.changecolor ? 1 : 0,
            lcnotes:       b.details    || b.notes || "",
            lcold_code:    b.variety_oldcode || b.old_code || "",
            lntolerance:   b.tolerance  ?? 0,
            llmix:         b.mix        ? 1 : 0,
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? row?.Unico ?? "", message: "Variety created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
