import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function PUT() {
    try {
        const r = await executeProcedure("sp_flower_subclass_update_clean_bogo", {});
        const row = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
