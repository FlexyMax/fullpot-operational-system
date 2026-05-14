import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const num = (v: any) => { const n = parseFloat(String(v||0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v||0)); return isNaN(n) ? 0 : n; };
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_customer_uq_for_customers", { lccustomer_uq: unico });
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_customers_update", {
            lcunico:                   unico,
            lcedi_code:                txt(b.edi_code),
            llfobmiami:                bit(b.fobmiami),
            llinventory:               bit(b.inventory_from_invoice),
            lldex:                     bit(b.dex),
            llauto_charge:             bit(b.auto_charge),
            llcredithold:              bit(b.credithold),
            llactive:                  bit(b.active),
            lccustomer:                txt(b.customer),
            lcdba:                     txt(b.dba),
            lccontact:                 txt(b.contact),
            lcpurchaser:               txt(b.purchaser),
            lcaddress1:                txt(b.address1),
            lcaddress2:                txt(b.address2),
            lccity:                    txt(b.city),
            lcstate:                   txt(b.state),
            lczip:                     txt(b.zip),
            lccountry:                 txt(b.country),
            lcphone_1:                 txt(b.phone_1),
            lcphone_2:                 txt(b.phone_2),
            lcfax_1:                   txt(b.fax_1),
            lcfax_2:                   txt(b.fax_2),
            lcemail:                   txt(b.email),
            lcterms_uq:                txt(b.terms_uq || b.terms),
            lccalls:                   txt(b.calls),
            lcsubregion_uq:            txt(b.subregion_uq),
            lcsalesman_uq:             txt(b.salesman_uq),
            lcgroup_uq:                txt(b.group_uq),
            lcrc_uq:                   txt(b.rc_uq),
            lcpick:                    txt(b.pickremark),
            lcjulian_from:             txt(b.julian_from),
            lcreasonhold:              txt(b.reasonhold),
            lncredit_limit:            num(b.credit_limit),
            lninsurance_for:           num(b.insurance_for),
            lnprice_margin:            num(b.price_margin),
            lcsales_web_uq:            txt(b.sales_web_uq),
            ldcustsince:               b.custsince ? new Date(b.custsince) : new Date(),
            lcap_contact:              txt(b.ap_contact),
            lcap_email:                txt(b.ap_email),
            lcap_msn:                  txt(b.ap_msn),
            lcap_phone:                txt(b.ap_phone),
            lcap_fax:                  txt(b.ap_fax),
            lcwebsite:                 txt(b.website),
            llstatement_print:         bit(b.statement_print),
            llinspection:              bit(b.inspection),
            lngpm:                     num(b.gpm),
            lcavailability_by:         txt(b.availability_by),
            lcavailability_to:         txt(b.availability_to),
            lcinvoice_by:              txt(b.invoice_by),
            lnextension:               int(b.extension),
            lncommission_days:         int(b.commission_days),
            lnresale_tax:              int(b.resale_tax),
            lcccard_name:              txt(b.ccard_name),
            lcccard_on_file:           txt(b.ccard_on_file),
            lcccard_expiration_month:  txt(b.ccard_expiration_month),
            lcccard_expiration_year:   txt(b.ccard_expiration_year),
            lctax_id:                  txt(b.tax_id),
            llinternational:           bit(b.international),
            llcollection:              bit(b.collection),
            lndry_discount:            num(b.dry_discount),
            llcheck_price_override:    bit(b.check_price_override),
            llinternal_customer:       bit(b.internal_customer),
        });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Customer updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const chk = await executeQuery(`SELECT COUNT(*) total FROM flower_customer_shipto WHERE cust_uq='${txt(unico)}'`);
        const total = chk.recordset[0]?.total ?? 0;
        if (total > 0) return NextResponse.json({ success: false, error: `You have ${total} related records in shipto! You can't delete this record.` }, { status: 400 });
        const r = await executeProcedure("sp_flower_customers_delete", { lccustomer_uq: unico });
        const row = r.recordset[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, message: row?.Message || "Customer deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
