import { NextResponse } from "next/server";

// sp_flower_packing_duties_products_credit_report does NOT exist in the database.
// This endpoint is a placeholder — implement when the SP is available.

export async function GET() {
    return NextResponse.json({
        success: false,
        error: "sp_flower_packing_duties_products_credit_report is not available in the database.",
        records: [],
    }, { status: 501 });
}
