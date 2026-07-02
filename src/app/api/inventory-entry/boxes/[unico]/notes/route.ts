import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";

type P = { params: Promise<{ unico: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_packing_box_notes", { lcpacking_box_uq: unico });
        return NextResponse.json(r.recordset?.[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_box_notes_update", {
            lcpacking_box_uq:  unico,
            lcinventory_notes: str(b.notes, 250),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Edit", "flower_packing_box", unico, "Notes").catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
