import { NextResponse } from "next/server";
import { executeQuery, executeProcedure } from "@/lib/db";

const SPS = [
    "sp_flower_growers_list",
    "sp_flower_cases_list",
    "sp_flower_warehouse_physical_list",
    "sp_flower_ws_airlines_list",
    "sp_flower_awb_dates",
    "sp_flower_awb_by_date",
    "sp_flower_packing_x_awb",
    "sp_flower_packing_box_by_awb",
    "sp_flower_packing_uq",
    "sp_flower_packing_box_uq",
    "sp_flower_packing_details",
    "sp_flower_packing_insert_new",
    "sp_flower_packing_update",
    "sp_flower_packing_delete",
    "sp_flower_packing_open",
    "sp_flower_packing_close",
    "sp_flower_packing_copy",
    "sp_flower_packing_reception",
    "sp_flower_packing_awb_change",
    "sp_flower_packing_to_whouse",
    "sp_flower_packings_to_move",
    "sp_flower_packing_box_insert",
    "sp_flower_packing_box_update_new",
    "sp_flower_packing_box_delete",
    "sp_flower_packing_box_copy",
    "sp_flower_packing_box_move",
    "sp_flower_packing_box_transfer",
    "sp_flower_packing_box_repacking",
    "sp_flower_packing_box_transform",
    "sp_flower_packing_box_update_price",
    "sp_flower_packing_box_update_whcontrol",
    "sp_flower_packing_stock_by_packing_box",
    "sp_flower_packing_stock_adjusts",
    "sp_flower_packing_box_in_invoice_box",
    "sp_flower_packing_box_search_in_whouse",
    "sp_flower_packing_box_composition",
    "sp_flower_packing_box_composition_insert",
    "sp_flower_packing_box_composition_update",
    "sp_flower_packing_box_composition_delete",
    "sp_flower_packing_awb_shiptos",
    "sp_flower_prebook_box_porder_dates_growers",
    "sp_flower_porders_by_grower",
    "sp_flower_inventory_insert_from_porder",
    "sp_flower_packing_update_from_packing",
    "sp_flower_product_uq",
    "sp_flower_products_last_inventory_entry",
    "sp_flower_invoice_box_by_packing",
];

export async function GET() {
    const results: Record<string, any> = {};
    for (const sp of SPS) {
        try {
            const r = await executeQuery(
                `SELECT p.name AS param, t.name AS type, p.max_length, p.is_output
                 FROM sys.parameters p
                 JOIN sys.types t ON p.user_type_id = t.user_type_id
                 WHERE p.object_id = OBJECT_ID('${sp}')
                 ORDER BY p.parameter_id`
            );
            results[sp] = r.recordset;
        } catch (e: any) {
            results[sp] = { error: e.message };
        }
    }

    // Quick smoke test — call sp_flower_awb_by_date with today
    try {
        const r = await executeProcedure("sp_flower_awb_by_date", { lddate: new Date() });
        results["_awb_by_date_test"] = { rows: r.recordset.length, sample: r.recordset[0] };
    } catch (e: any) {
        results["_awb_by_date_test"] = { error: (e as any).message };
    }

    return NextResponse.json(results);
}
