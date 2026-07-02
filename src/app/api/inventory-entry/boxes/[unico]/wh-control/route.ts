import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";

type P = { params: Promise<{ unico: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_box_update_whcontrol", {
            lcunico:       unico,
            lccase_uq:     str(b.case_uq,  8),
            lnbox_qty:     int(b.box_qty),
            lnpacks_box:   int(b.packs_box),
            lnpacks_units: int(b.packs_units),
            lcuser_uq:     str(b.user_uq,  8),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Edit", "flower_packing_box", unico, "WH Control").catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
