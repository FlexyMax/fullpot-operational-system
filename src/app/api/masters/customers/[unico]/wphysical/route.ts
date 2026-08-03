import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";
const txt   = (v: any) => String(v ?? "").trim();

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    try {
        const { unico } = await params;
        const r = await executeProcedure("sp_NC_customer_wphysical_list", {
            customer_uq: txt(unico),
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_NC_customer_wphysical_insert", {
            customer_uq: txt(unico),
            pw_uq:       txt(b.pw_uq),
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Insert", "flower_customers_wphysical", row?.unico ?? "").catch(() => {});
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
