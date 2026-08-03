import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";
const txt   = (v: any) => String(v ?? "").trim();

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ unico: string; wunico: string }> }) {
    try {
        const { wunico } = await params;
        const r = await executeProcedure("sp_NC_customer_wphysical_delete", {
            unico: txt(wunico),
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Delete", "flower_customers_wphysical", txt(wunico)).catch(() => {});
        return NextResponse.json({ success: true, message: row?.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
