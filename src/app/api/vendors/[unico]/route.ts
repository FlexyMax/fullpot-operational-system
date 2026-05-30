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
        const r = await executeProcedure("sp_flower_growers_uq", { lcgrower_uq: unico });
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
            lcmsn_hotmail:              str(b.msn_hotmail ?? ""),
            lcmanager:                  str(b.manager),
            lcsecretary:                str(b.secretary),
            llproduction:               bit(b.production),
            lcsales_person:             str(b.sales_person ?? b.salesman ?? ""),
            lnship_days:                int(b.ship_days),
            lcedi_code:                 str(b.edi_code ?? b.old_code ?? ""),
            llinternational:            bit(b.international),
            lcbankname:                 str(b.bankname ?? b.bank ?? ""),
            lcbank_account:             str(b.bank_account),
            llchange_password:          bit(b.change_password),
            llweb_confirm_boxes:        bit(b.web_confirm_boxes ?? b.chk_boxes),
            llweb_confirm_stems:        bit(b.web_confirm_stems ?? b.chk_stems),
            llqb_flower:                bit(b.qb_flower),
            llqb_freight:               bit(b.qb_freight),
            llqb_handling:              bit(b.qb_handling ?? false),
            llqb_broker:                bit(b.qb_broker ?? false),
            llqb_ocharges:              bit(b.qb_ocharges ?? false),
            llqb_duties:                bit(b.qb_duties ?? false),
            llapply_freight:            bit(b.apply_freight),
            llflower_sys:               bit(b.flower_sys ?? b.flower_system),
            llauto_packing:             bit(b.auto_packing),
            llduties:                   bit(b.duties),
            llbroker:                   bit(b.broker),
            llhandling:                 bit(b.handling ?? false),
            llocharges:                 bit(b.ocharges ?? false),
            llfreight:                  bit(b.freight ?? false),
            lncon_comi:                 num(b.con_comi ?? b.commission ?? 0),
            lnfuel:                     num(b.fuel ?? b.fuel_discount ?? 0),
            lnsales_factor:             num(b.sales_factor),
            lnpack_return:              num(b.pack_return),
            lnpack_p_ret:               num(b.pack_p_ret ?? b.pack_disc ?? 0),
            lnfreight_kg:               num(b.freight_kg ?? 0),
            lcfreight_type:             str(b.freight_type ?? ""),
            lcwhouse_farm_id:           str(b.whouse_farm_id),
            lctext_invoice:             str(b.text_invoice),
            lctext_label:               str(b.text_label ?? b.text_packing ?? ""),
            llsend_file:                bit(b.send_file ?? b.send_file_warehouse),
            llspecial:                  bit(b.special ?? b.special_contributor),
            llinventory_from_products:  bit(b.inventory_from_products ?? false),
            lcpassword:                 str(b.password ?? b.clave ?? ""),
            lcterms_uq:                 str(b.terms_uq),
            lctype_uq:                  str(b.type_uq ?? b.agency_uq ?? ""),
            lccargo_uq:                 str(b.cargo_uq ?? b.group_uq ?? ""),
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
        const r = await executeProcedure("sp_flower_growers_delete", { lcgrower_uq: unico });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
