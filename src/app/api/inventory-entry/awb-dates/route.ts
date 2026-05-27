import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/inventory-entry/awb-dates
// Returns available ship dates with AWB counts for the Date Picker grid
export async function GET() {
    try {
        const r = await executeProcedure("sp_flower_awb_dates", {});
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
