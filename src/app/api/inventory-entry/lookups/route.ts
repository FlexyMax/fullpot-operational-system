import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const [growers, cases, warehouses, airlines] = await Promise.all([
            executeProcedure("sp_flower_growers_list", { llall: 0 }),
            executeProcedure("sp_flower_cases_list", {}),
            executeProcedure("sp_flower_warehouse_physical_list", { llall: 0 }),
            executeProcedure("sp_flower_ws_airlines_list", {}),
        ]);
        return NextResponse.json({
            growers:    growers.recordset    ?? [],
            cases:      cases.recordset      ?? [],
            warehouses: warehouses.recordset ?? [],
            airlines:   airlines.recordset   ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
