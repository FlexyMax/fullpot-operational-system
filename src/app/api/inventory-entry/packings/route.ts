import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const bit = (v: any) => (v ? 1 : 0);

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_insert_new", {
            lcgrower_uq:        str(b.grower_uq,  8),
            lcpacking_no:       str(b.packing_no, 20),
            ldinvoice_date:     b.invoice_date ? new Date(b.invoice_date) : new Date(),
            lcinvoice_no:       str(b.invoice_no, 20),
            lcawbcode:          str(b.awbcode,    20),
            lcairline_uq:       str(b.airline_uq,  8),
            lcdetails:          str(b.details,   200),
            lnporder_no:        int(b.porder_no),
            lcwphysical_uq:     str(b.wphysical_uq, 8),
            ldavailable_date:   b.available_date ? new Date(b.available_date) : new Date(),
            llinhouse:          bit(b.inhouse),
            llconsolidated:     bit(b.consolidated),
            lcuser_uq:          str(b.user_uq, 8),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? row?.UNICO });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
