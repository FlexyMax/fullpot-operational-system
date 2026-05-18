import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_customer_uq_for_customers", {
            lccustomer_uq: unico,
        });
        return NextResponse.json(r.recordset?.[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        // sp_flower_customers_update_from_payments — 27 verified params (2026-05-18)
        // NOTE: no add_credit_limit/add_cr_exp_date in SP; discount_percentage → @lndiscount
        const r = await executeProcedure("sp_flower_customers_update_from_payments", {
            lcunico:                   unico,
            lccontact:                 b.contact                   ?? "",
            lcpurchaser:               b.purchaser                 ?? "",
            lcaddress1:                b.address1                  ?? "",
            lccity:                    b.city                      ?? "",
            lcstate:                   b.state                     ?? "",
            lccountry:                 b.country                   ?? "",
            lcphone_1:                 b.phone_1                   ?? "",
            lcfax_1:                   b.fax_1                     ?? "",
            lcemail:                   b.email                     ?? "",
            lncredit_limit:            b.credit_limit              ?? 0,
            lnprice_margin:            b.price_margin              ?? 0,
            llcredithold:              b.credithold                ? 1 : 0,
            lcreasonhold:              b.reasonhold                ?? "",
            llactive:                  b.active !== false          ? 1 : 0,
            llauto_charge:             b.auto_charge               ? 1 : 0,
            lninsurance_for:           b.insurance_for             ?? 0,
            lcstatement_by:            b.statement_by              ?? "",
            lcap_email:                b.ap_email                  ?? "",
            lcap_fax:                  b.ap_fax                    ?? "",
            lnextension:               parseInt(b.extension)       || 0,
            lndiscount:                b.discount_percentage       ?? 0,
            lnresale_tax:              parseInt(b.resale_tax)      || 0,
            lcccard_name:              b.ccard_name                ?? "",
            lcccard_on_file:           b.ccard_on_file             ?? "",
            lcccard_expiration_month:  b.ccard_expiration_month    ?? "",
            lcccard_expiration_year:   b.ccard_expiration_year     ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
