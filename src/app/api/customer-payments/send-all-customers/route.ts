import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        // Returns customers with balance that have email/fax statement preference
        // lcsalesman_uq = '%' gets all salesmen
        const r = await executeProcedure("sp_flower_customers_by_salesman_to_statement", {
            lcsalesman_uq: "%",
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
