import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: Request) {
    const b = await req.json();
    if (!b.awbcode)      return NextResponse.json({ success: false, error: "AWB code is required." }, { status: 400 });
    if (!b.supplier_uq)  return NextResponse.json({ success: false, error: "Supplier is required." }, { status: 400 });
    if (!b.ap_type_uq)   return NextResponse.json({ success: false, error: "Charge type is required." }, { status: 400 });
    if (!b.invoice_no)   return NextResponse.json({ success: false, error: "Invoice is required." }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_awbs_charges_insert", {
            lcawbcode:      b.awbcode,
            lcsupplier_uq:  b.supplier_uq,
            lcap_type_uq:   b.ap_type_uq,
            lnduties:       parseFloat(b.duties)    || 0,
            lno_charges:    parseFloat(b.o_charges) || 0,
            ldapply_from:   b.apply_from            ?? null,
            ldapply_to:     b.apply_to              ?? null,
            ldcharge_date:  b.charge_date           ?? null,
            lcinvoice_no:   b.invoice_no            ?? "",
            lcdescription:  b.description           ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? "" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
