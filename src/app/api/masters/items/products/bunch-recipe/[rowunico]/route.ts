import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ rowunico: string }> }) {
    const { rowunico } = await params;
    try {
        await executeProcedure("sp_flower_products_composition_delete", { lcunico: rowunico });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
