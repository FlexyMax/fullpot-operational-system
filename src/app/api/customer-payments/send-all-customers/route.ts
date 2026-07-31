import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        // Uses the same SP as the main customer list, balance > 0, all customers in one page
        const r = await executeProcedure("sp_NC_customers_list_for_statement", {
            lnPageNumber:     1,
            lnRowsOfPage:     9999,
            lccustomer_name:  "",
            lnBalance:        "B",
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
