import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const result = await executeProcedure("sp_NC_varieties_packs_list", { lcvariety_uq: unico });
        return NextResponse.json(result.recordset);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const body = await req.json();
        const result = await executeProcedure("sp_flower_varieties_packs_insert", {
            lcvariety_uq:  unico,
            lcgrade_uq:    body.grade_uq,
            lnstems_bunch: body.stems_bunch ?? 0,
            lnfbox:        body.fbox  ?? 0,
            lnhbox:        String(body.hbox ?? "0"),
            lnqbox:        body.qbox  ?? 0,
            lnebox:        body.ebox  ?? 0,
        });
        const row = result.recordset?.[0];
        serverAuditLog(PANTA, "Insert", "flower_varieties_packs", row?.unico || unico, `Pack ${body.grade_uq}`).catch(() => {});
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.message });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}
