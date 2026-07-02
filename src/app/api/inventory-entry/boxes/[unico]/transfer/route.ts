import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";

type P = { params: Promise<{ unico: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };

export async function POST(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_box_transfer", {
            lcpacking_box_uq: unico,
            lcwphysical_uq:   str(b.wphysical_uq,  8),
            lcawbcode:        str(b.awbcode,       11),
            lddate_invo:      b.date_invo   ? new Date(b.date_invo)   : new Date(),
            ldavailable:      b.available   ? new Date(b.available)   : new Date(),
            lcinvoice_no:     str(b.invoice_no,    15),
            lnbox_qty:        int(b.box_qty),
            lnbox_freight:    num(b.box_freight),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Insert", "flower_packing_stock", unico, "Transfer to WH").catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
