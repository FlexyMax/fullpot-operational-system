import { NextResponse } from "next/server";

// sp_flower_accounts_rec_statment_balance_cut_report — NOT FOUND in DB as of 2026-05-18
export async function POST() {
    return NextResponse.json({ success: false, error: "sp_flower_accounts_rec_statment_balance_cut_report not available." }, { status: 501 });
}
