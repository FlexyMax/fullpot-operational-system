import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ quota_uq: string }> }) {
    const { quota_uq } = await params;
    try {
        const r = await executeProcedure("sp_flower_products_quotas_growers_in", { lcquota_uq: quota_uq });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
