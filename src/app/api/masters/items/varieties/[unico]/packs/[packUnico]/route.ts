import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ unico: string; packUnico: string }> }) {
    const { packUnico } = await params;
    try {
        const body = await req.json();
        await executeProcedure("sp_flower_varieties_packs_update", {
            lcunico:       packUnico,
            lcgrade_uq:    body.grade_uq,
            lnstems_bunch: body.stems_bunch ?? 0,
            lnfbox:        body.fbox  ?? 0,
            lnhbox:        String(body.hbox ?? "0"),
            lnqbox:        body.qbox  ?? 0,
            lnebox:        body.ebox  ?? 0,
        });
        serverAuditLog(PANTA, "Edit", "flower_varieties_packs", packUnico, `Pack ${body.grade_uq}`).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ unico: string; packUnico: string }> }) {
    const { packUnico } = await params;
    try {
        await executeProcedure("sp_flower_varieties_packs_delete", { lcunico: packUnico });
        serverAuditLog(PANTA, "Delete", "flower_varieties_packs", packUnico, "Pack deleted").catch(() => {});
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
}
