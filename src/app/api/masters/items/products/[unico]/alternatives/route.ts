import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_products_alternative_in", { lcproduct_uq: unico });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
