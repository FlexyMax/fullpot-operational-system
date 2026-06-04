import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/pos/lookups — all static lookup lists loaded once on mount
export async function GET() {
    try {
        const [carriers, banks, accountTypes, cargoAgencies, creditReasons] = await Promise.all([
            executeProcedure("sp_flower_carriers_list",       {}),
            executeProcedure("sp_flower_banks_list",          {}),
            executeProcedure("sp_flower_accounts_inout_types",{}),
            executeProcedure("sp_flower_cargo_agencies_list", { lnAll: 0 }),
            executeProcedure("sp_flower_crdb_reasons_list",   {}),
        ]);
        return NextResponse.json({
            carriers:     carriers.recordset     ?? [],
            banks:        banks.recordset        ?? [],
            accountTypes: accountTypes.recordset ?? [],
            cargoAgencies:cargoAgencies.recordset ?? [],
            creditReasons:creditReasons.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
