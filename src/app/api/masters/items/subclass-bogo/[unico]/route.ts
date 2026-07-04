import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

export async function GET(_req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_NC_subclass_bogo_uq", { lcunico: unico });
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
        serverAuditLog(PANTA, "Edit", "flower_subclases", unico, "BOGO").catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
