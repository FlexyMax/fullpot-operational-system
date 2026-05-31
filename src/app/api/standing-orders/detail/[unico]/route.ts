import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_standing_order_uq", { lcso_uq: unico });
        const sets = (r as any).recordsets ?? [r.recordset ?? []];
        return NextResponse.json({
            header:  sets[0]?.[0] ?? null,
            lines:   sets[1]      ?? [],
            vendors: sets[2]      ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
