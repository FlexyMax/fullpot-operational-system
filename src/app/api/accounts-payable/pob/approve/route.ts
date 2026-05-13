import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function POST(req: NextRequest) {
    const { ap_uq } = await req.json();
    if (!ap_uq) return NextResponse.json({ error: "ap_uq required" }, { status: 400 });
    try {
        await executeProcedure("sp_flower_accounts_pay_approve_cost", {
            lcunico:    ap_uq,
            llapproved: 1
        });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
