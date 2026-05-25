import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const SPS = [
    "sp_flower_growers_list_for_growers",
    "sp_flower_growers_uq",
    "sp_flower_growers_insert",
    "sp_flower_growers_update",
    "sp_flower_growers_delete",
    "sp_flower_growers_class_in",
    "sp_flower_growers_class_not_in",
    "sp_flower_growers_class_insert",
    "sp_flower_growers_class_delete",
    "sp_flower_growers_documents",
    "sp_flower_growers_documents_insert",
    "sp_flower_growers_documents_update",
    "sp_flower_growers_documents_delete",
    "sp_flower_growers_documents_uq",
    "sp_flower_growers_types",
    "sp_flower_growers_types_insert",
    "sp_flower_growers_types_update",
    "sp_flower_growers_types_delete",
    "sp_flower_accounts_rec_statment_balance",
    "sp_flower_growers_pending_invoices_to_growers",
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
    return NextResponse.json(results);
}
