import { NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";

const SPS = [
    "sp_flower_salesman_list",
    "sp_flower_salesman_list_for_salesmen",
    "sp_flower_salesman_uq",
    "sp_flower_salesmen_insert",
    "sp_flower_salesmen_update",
    "sp_flower_salesmen_delete",
    "sp_flower_customers_by_salesman",
    "sp_flower_salesmen_growers",
    "sp_flower_salesmen_growers_not_in",
    "sp_flower_salesmen_class_prod",
    "sp_flower_salesmen_class_not_in",
    "sp_flower_warehouses_by_salesman",
    "sp_flower_warehouses_by_salesman_not_in",
    "sp_flower_salesmen_cities",
    "sp_flower_cities_not_in_salesman",
    "sp_flower_salesmen_salesmen_in",
    "sp_flower_salesmen_salesmen_not_in",
    "sp_flower_warehouse_physical_list",
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

    // Also try calling sp_flower_salesman_list with common param variations
    const listTests: Record<string, any> = {};
    for (const param of [{ llactive: 0 }, { lnactive: 0 }, { llParam: 0 }, {}]) {
        const key = JSON.stringify(param);
        try {
            const r = await executeProcedure("sp_flower_salesman_list", param);
            listTests[key] = { rows: r.recordset.length, sample: r.recordset[0] };
        } catch (e: any) {
            listTests[key] = { error: e.message };
        }
    }
    results["_list_test"] = listTests;

    return NextResponse.json(results);
}
