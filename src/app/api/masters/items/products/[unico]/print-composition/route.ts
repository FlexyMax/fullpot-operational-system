import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const type = new URL(req.url).searchParams.get("type") || "bouquet";
    try {
        // Only bouquet SP exists (verified 2026-05-16); box and extended are Coming Soon
        if (type === "bouquet") {
            const r = await executeProcedure("sp_flower_products_composition_report", { lcproduct_uq: unico });
            return NextResponse.json(r.recordset);
        }
        return NextResponse.json({ error: `${type} composition SP not available` }, { status: 501 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
