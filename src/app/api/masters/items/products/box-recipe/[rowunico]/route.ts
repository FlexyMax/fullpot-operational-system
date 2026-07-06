import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ rowunico: string }> }) {
    const { rowunico } = await params;
    const { product_uq, assproduct_uq, qty, match_variety, porcentage } = await req.json();
    try {
        await executeProcedure("sp_flower_products_ass_detail_update", {
            lcunico:         rowunico,
            lcproduct_uq:    product_uq,
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ rowunico: string }> }) {
    const { rowunico } = await params;
    try {
        await executeProcedure("sp_flower_products_ass_detail_delete", { lcunico: rowunico });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
