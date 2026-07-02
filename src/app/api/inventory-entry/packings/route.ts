import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "52961702";
const TABLA = "flower_packing";

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const bit = (v: any) => (v ? 1 : 0);
const newUnico = () => randomBytes(4).toString("hex").toUpperCase();

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const unico = newUnico();
        const r = await executeProcedure("sp_flower_packing_insert_new", {
            lcunico:        unico,
            packing_no:     str(b.packing_no, 20),
            invoice_no:     str(b.invoice_no, 20),
            grower_uq:      str(b.grower_uq,  8),
            awbcode:        str(b.awbcode,    11),
            date_invo:      b.invoice_date ? new Date(b.invoice_date) : new Date(),
            details:        str(b.details,  254),
            wphysical_uq:   str(b.wphysical_uq, 8),
            lnporder_no:    int(b.porder_no),
            ldavailable:    b.available_date ? new Date(b.available_date) : new Date(),
            llconsolidated: bit(b.consolidated),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Insert", TABLA, unico).catch(() => {});
        return NextResponse.json({ success: true, unico });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
