import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ unico: string }> };

const bit = (v: any) => (v ? 1 : 0);
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_growers_uq", { lcunico: unico });
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_growers_update", {
            lcunico:                    unico,
            lcgrower:                   str(b.grower),
            lcfarm:                     str(b.farm),
            lcsource:                   str(b.source),
            lcnit_ruc:                  str(b.nit_ruc),
            llactive:                   bit(b.active),
            lcofficeadd1:               str(b.officeadd1),
            lcofficeadd2:               str(b.officeadd2),
            lcfarm_add1:                str(b.farm_add1),
            lcfarm_add2:                str(b.farm_add2),
            lcfob:                      str(b.fob),
            lccity:                     str(b.city),
            lccountry:                  str(b.country),
            lcphone_1:                  str(b.phone_1),
            lcphone_2:                  str(b.phone_2),
            lcfax_1:                    str(b.fax_1),
            lcfax_2:                    str(b.fax_2),
            lccelular:                  str(b.celular),
            lcemail_1:                  str(b.email_1),
            lcemail_2:                  str(b.email_2),
            lcmsn_yahoo:                str(b.msn_yahoo),
            lcmanager:                  str(b.manager),
            lcsecretary:                str(b.secretary),
            lcproduction:               str(b.production),
            lcsalesman:                 str(b.salesman),
            lnship_days:                int(b.ship_days),
            lnold_code:                 int(b.old_code),
            llinternational:            bit(b.international),
            lcbank:                     str(b.bank),
            lcbank_account:             str(b.bank_account),
            llchange_password:          bit(b.change_password),
            llchk_boxes:                bit(b.chk_boxes),
            llchk_stems:                bit(b.chk_stems),
            llqb_flower:                bit(b.qb_flower),
            llqb_freight:               bit(b.qb_freight),
            llapply_freight:            bit(b.apply_freight),
            llflower_cost:              bit(b.flower_cost),
            llauto_packing:             bit(b.auto_packing),
            llduties:                   bit(b.duties),
            llbroker:                   bit(b.broker),
            lncommission:               num(b.commission),
            lnfuel_discount:            num(b.fuel_discount),
            lnsales_factor:             num(b.sales_factor),
            lnhandling:                 num(b.handling),
            lnocharges:                 num(b.ocharges),
            lnpack_disc:                num(b.pack_disc),
            lnpack_return:              num(b.pack_return),
            lcwhouse_farm_id:           str(b.whouse_farm_id),
            lctext_invoice:             str(b.text_invoice),
            lctext_packing:             str(b.text_packing),
            llflower_system:            bit(b.flower_system),
            llsend_file_warehouse:      bit(b.send_file_warehouse),
            llspecial_contributor:      bit(b.special_contributor),
            lcclave:                    str(b.clave),
            lcterms_uq:                 str(b.terms_uq),
            lcagency_uq:                str(b.agency_uq),
            lcgroup_uq:                 str(b.group_uq),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_growers_delete", { lcunico: unico });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
