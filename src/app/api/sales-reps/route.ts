import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";

const bit = (v: any) => (v ? 1 : 0);
const num = (v: any) => { const n = parseFloat(String(v ?? 0)); return isNaN(n) ? 0 : n; };
const int = (v: any) => { const n = parseInt(String(v ?? 0), 10); return isNaN(n) ? 0 : n; };
const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);

export async function GET(_req: NextRequest) {
    try {
        const r = await executeQuery(`
            SELECT 
                unico,
                old_code,
                salesman_fname AS first_name,
                salesman_lname AS last_name,
                salesman_name,
                phone_1,
                wphysical_uq,
                email_1,
                active
            FROM flower_salesmen
            ORDER BY salesman_name
        `);
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_salesmen_insert", {
            lcuser_uq:              str(b.user_uq, 8),
            lnold_code:             int(b.old_code),
            lcsalesman_fname:       str(b.first_name, 20),
            lcsalesman_lname:       str(b.last_name, 20),
            lcaddress:              str(b.address, 50),
            lcphone_1:              str(b.phone_1, 15),
            lcphone_2:              str(b.phone_2, 15),
            lcemail_1:              str(b.email_1, 50),
            lcemail_2:              str(b.email_2, 50),
            lcwphysical_uq:         str(b.wphysical_uq, 8),
            lcsuperior_uq:          str(b.superior_uq, 8),
            lncommi_osales:         num(b.commi_osales),
            lndue_days:             int(b.due_days),
            lnautho_over:           num(b.autho_over),
            llview_days:            bit(b.view_days),
            llview_hold:            bit(b.view_hold),
            llchange_prices:        bit(b.change_prices),
            llview_flowercost:      bit(b.view_flowercost),
            llview_lot:             bit(b.view_lot),
            llmove_hold:            bit(b.move_hold),
            llremote:               bit(b.remote),
            llpo_unreception:       bit(b.po_unreception),
            llview_grower:          bit(b.view_grower),
            llprice_override:       bit(b.price_override),
            llchange_product:       bit(b.change_product),
            llwhouse_control:       bit(b.whouse_control),
            lledit_all_inv:         bit(b.edit_all_inv),
            llcredit_override:      bit(b.credit_override),
            lnlot_fifo_lifo:        int(b.lot_fifo_lifo),
            llview_all_inv:         bit(b.view_all_inv),
            llview_all_customers:   bit(b.view_all_customers),
            llview_price_wo_fuel:   bit(b.view_price_wo_fuel),
            llautorize_transfer:    bit(b.autorize_transfer),
            llcls_spcarriers:       bit(b.cls_spcarriers),
            llweb:                  bit(b.web),
            lldelete_lines:         bit(b.delete_lines),
            llopen_packing:         bit(b.open_packing),
            lllimited_po:           bit(b.limited_po),
            llview_quotas:          bit(b.view_quotas),
            lncommi_gsales:         num(b.commi_gsales),
            llloc_autotran:         bit(b.loc_autotran),
            llopen_invoice:         bit(b.open_invoice),
            llprint_customers:      bit(b.print_customers),
            llprint_all_customers:  bit(b.print_all_customers),
            llview_pb_recipe:       bit(b.view_pb_recipe),
            llapprove_override:     bit(b.approve_override),
            llmake_payment:         bit(b.make_payment),
            lllock_production:      bit(b.lock_production),
            llview_qty_in:          bit(b.view_qty_in),
            llupdate_stock_invoice: bit(b.update_stock_invoice),
            llpti_take_om:          bit(b.pti_take_om),
            llview_om:              bit(b.view_om),
            llinventory_from_po:    bit(b.inventory_from_po),
            llpo_change_date:       bit(b.po_change_date),
            llopen_prebook:         bit(b.open_prebook),
            llseason_poprice:       bit(b.season_poprice),
            llview_reports:         bit(b.view_reports),
            llreports_all_salesmen: bit(b.reports_all_salesmen),
            llinvoice_add_charges:  bit(b.invoice_add_charges),
            llinvoice_scan_sale:    bit(b.invoice_scan_sale),
            llcredit_all_inv:       bit(b.credit_all_inv),
            llaccept_returns:       bit(b.accept_returns),
            llview_whouse:          bit(b.view_whouse),
            llmake_discounts:       bit(b.make_discounts),
            llview_sales_price:     bit(b.view_sales_price),
            llprebook_check_stock:  bit(b.prebook_check_stock),
            llsupervisor:           bit(b.supervisor),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? row?.UNICO, message: "Sales rep created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
