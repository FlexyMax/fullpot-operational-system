import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const b = await req.json();
    if (!b.ap_type_uq)  return NextResponse.json({ success: false, error: "Charge type is required." }, { status: 400 });
    if (!b.supplier_uq) return NextResponse.json({ success: false, error: "Supplier is required." }, { status: 400 });
    if (!b.invoice_no)  return NextResponse.json({ success: false, error: "Invoice is required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_awbs_charges_by_date_update", {
            lcunico:       unico,
            lcap_type_uq:  b.ap_type_uq,
            lcsupplier_uq: b.supplier_uq,
            ldcharge_date: b.charge_date  ?? null,
            ldfrom:        b.apply_from   ?? null,
            ldto:          b.apply_to     ?? null,
            lntotal_box:   parseFloat(b.total_box)  || 0,
            lnduties:      parseFloat(b.duties)     || 0,
            lnocharges:    parseFloat(b.ocharges)   || 0,
            lcnotes:       b.notes        ?? "",
            lninvoice_no:  b.invoice_no   ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_awbs_charges_by_date_delete", { lcunico: unico });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
