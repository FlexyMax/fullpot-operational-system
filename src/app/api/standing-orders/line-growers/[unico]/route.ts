import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    if (!unico) return NextResponse.json([], { status: 200 });
    try {
        const r = await executeProcedure("sp_flower_standing_orders_detail_growers", {
            lcsorderd_uq: unico,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
