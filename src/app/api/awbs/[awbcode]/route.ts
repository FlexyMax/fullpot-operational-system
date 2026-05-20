import { NextResponse } from "next/server";

// sp_flower_awbs_delete and sp_flower_awbs_date_update do NOT exist in the database.
// These endpoints are placeholders — implement when the SPs are available.

export async function DELETE() {
    return NextResponse.json({
        success: false,
        error: "sp_flower_awbs_delete is not available in the database.",
    }, { status: 501 });
}

export async function PUT() {
    return NextResponse.json({
        success: false,
        error: "sp_flower_awbs_date_update is not available in the database.",
    }, { status: 501 });
}
