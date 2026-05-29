import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ pack_uq: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { pack_uq } = await params;
    try {
        const r = await executeProcedure("sp_flower_packing_details", { pack_uq });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
