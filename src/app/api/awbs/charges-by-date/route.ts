import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const from = req.nextUrl.searchParams.get("from") || "";
    const to   = req.nextUrl.searchParams.get("to")   || "";
    try {
        const r = await executeProcedure("sp_flower_awb_charges_by_date", {
            start_date: from || null,
            end_date:   to   || null,
        });
        return NextResponse.json({ records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const b = await req.json();
    if (!b.ap_type_uq)  return NextResponse.json({ success: false, error: "Charge type is required." }, { status: 400 });
    if (!b.supplier_uq) return NextResponse.json({ success: false, error: "Supplier is required." }, { status: 400 });
    if (!b.ocharges && b.ocharges !== 0) return NextResponse.json({ success: false, error: "Amount is required." }, { status: 400 });
    if (!b.invoice_no)  return NextResponse.json({ success: false, error: "Invoice is required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_awbs_charges_by_date_insert", {
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
        return NextResponse.json({ success: true, unico: row?.unico ?? "" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
