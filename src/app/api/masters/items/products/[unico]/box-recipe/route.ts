import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_products_ass_detail", { lcproduct_uq: unico });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const { assproduct_uq, qty, match_variety, porcentage } = await req.json();
    if (!assproduct_uq) return NextResponse.json({ success: false, error: "Product is required" }, { status: 400 });
    try {
        await executeProcedure("sp_flower_products_ass_detail_insert", {
            lcproduct_uq:    unico,
            lcassproduct_uq: assproduct_uq,
            lnqty:           qty ?? 0,
            llmatch:         match_variety ? 1 : 0,
            lnporcentage:    porcentage ?? 0,
        });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
