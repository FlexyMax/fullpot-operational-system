import { NextResponse } from "next/server";

// sp_flower_put_on_hold_customers_with_no_sales — NOT FOUND in DB as of 2026-05-18
export async function POST() {
    return NextResponse.json({ success: false, error: "sp_flower_put_on_hold_customers_with_no_sales not available in this database." }, { status: 501 });
}
