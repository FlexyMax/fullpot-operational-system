import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// sp_flower_awbs_invoice_charges_update params (verified):
// @lcunico, @lcPack_uq, @lcawbcode, @lcap_type_uq,
// @ldinvoice_date, @lnamount, @lcinvoice_no, @lcsupplier_uq, @lcdescription

export async function PUT(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const b = await req.json();
    if (!b.pack_uq)     return NextResponse.json({ success: false, error: "Packing UQ is required." }, { status: 400 });
    if (!b.awbcode)     return NextResponse.json({ success: false, error: "AWB code is required." }, { status: 400 });
    if (!b.ap_type_uq)  return NextResponse.json({ success: false, error: "Charge type is required." }, { status: 400 });
    if (!b.supplier_uq) return NextResponse.json({ success: false, error: "Supplier is required." }, { status: 400 });
    if (!b.invoice_no)  return NextResponse.json({ success: false, error: "Invoice is required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_awbs_invoice_charges_update", {
            lcunico:       unico,
            lcPack_uq:     b.pack_uq,     // note: SP uses capital P
            lcawbcode:     b.awbcode,
            lcap_type_uq:  b.ap_type_uq,
            ldinvoice_date: b.invoice_date ?? null,
            lnamount:      parseFloat(b.amount) || 0,
            lcinvoice_no:  b.invoice_no    ?? "",
            lcsupplier_uq: b.supplier_uq,
            lcdescription: b.description   ?? "",
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
        const r = await executeProcedure("sp_flower_awbs_invoice_charges_delete", { lcunico: unico });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
