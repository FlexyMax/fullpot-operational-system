import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const b = await req.json();
    if (!b.awbcode)     return NextResponse.json({ success: false, error: "AWB code is required." }, { status: 400 });
    if (!b.ap_type_uq)  return NextResponse.json({ success: false, error: "Charge type is required." }, { status: 400 });
    if (!b.supplier_uq) return NextResponse.json({ success: false, error: "Supplier is required." }, { status: 400 });
    if (!b.invoice_no)  return NextResponse.json({ success: false, error: "Invoice is required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_awbs_charges_update", {
            lcunico:       unico,
            lcawbcode:     b.awbcode,
            lcap_type_uq:  b.ap_type_uq,
            ldawc_date:    b.awc_date      ?? null,
            lcsupplier_uq: b.supplier_uq,
            lno_charges:   parseFloat(b.o_charges)   || 0,
            lnhandling:    parseFloat(b.handling)     || 0,
            lnfreight:     parseFloat(b.freight)      || 0,
            lnbroker:      parseFloat(b.broker)       || 0,
            lnduties:      parseFloat(b.duties)       || 0,
            lnoc_ammount:  parseFloat(b.oc_ammount)   || 0,
            lntotal_boxes: parseFloat(b.total_boxes)  || 0,
            lcdescription: b.description   ?? "",
            lcinvoice_no:  b.invoice_no    ?? "",
            ldinvoice_date: b.invoice_date ?? null,
            lnfull_boxes:  parseFloat(b.full_boxes)   || 0,
            lnweight:      parseFloat(b.weight)       || 0,
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
        const r = await executeProcedure("sp_flower_awbs_charges_delete", { lcunico: unico });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
