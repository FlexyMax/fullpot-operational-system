import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ awbcode: string }> }) {
    const { awbcode } = await params;
    try {
        const r = await executeProcedure("sp_flower_awbs_charges_by_packing_template", { lcawbcode: awbcode });
        return NextResponse.json({ success: true, records: r.recordset });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
