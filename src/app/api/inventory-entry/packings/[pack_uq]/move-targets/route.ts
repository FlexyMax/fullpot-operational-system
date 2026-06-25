import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ pack_uq: string }> };

// GET /api/inventory-entry/packings/[pack_uq]/move-targets
// Candidate destination packings for "Move Box" (sp_flower_packings_to_move)
export async function GET(_req: NextRequest, { params }: P) {
    const { pack_uq } = await params;
    try {
        const r = await executeProcedure("sp_flower_packings_to_move", { lcpacking_uq: pack_uq });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
