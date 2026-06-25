import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ pack_uq: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const bit = (v: any) => (v ? 1 : 0);

export async function GET(_req: NextRequest, { params }: P) {
    const { pack_uq } = await params;
    try {
        const r = await executeProcedure("sp_flower_packing_uq", { lcpacking_uq: pack_uq });
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { pack_uq } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_update", {
            unico:           pack_uq,
            packing_no:      str(b.packing_no, 20),
            invoice_no:      str(b.invoice_no, 20),
            grower_uq:       str(b.grower_uq,  8),
            awbcode:         str(b.awbcode,    11),
            date_invo:       b.invoice_date ? new Date(b.invoice_date) : new Date(),
            details:         str(b.details,  254),
            wphysical_uq:    str(b.wphysical_uq, 8),
            lnporder_no:     int(b.porder_no),
            ldavailable:     b.available_date ? new Date(b.available_date) : new Date(),
            llconsolidated:  bit(b.consolidated),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: P) {
    const { pack_uq } = await params;
    const b = await req.json().catch(() => ({}));
    try {
        const r = await executeProcedure("sp_flower_packing_delete", {
            lcunico:    pack_uq,
            lcuser_uq:  str(b.user_uq, 8),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
