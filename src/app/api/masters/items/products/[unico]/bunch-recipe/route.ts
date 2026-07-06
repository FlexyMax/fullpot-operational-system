import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const nullIfEmpty = (v: any) => (v === "" || v == null) ? null : v;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_products_composition", { lcproduct_uq: unico });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const { variety_uq, qty, grade_uq, color_uq, notes, unit } = await req.json();
    if (!variety_uq) return NextResponse.json({ success: false, error: "Variety is required" }, { status: 400 });
    try {
        await executeProcedure("sp_flower_products_composition_insert", {
            lcproduct_uq: unico,
            lcvariety_uq: variety_uq,
            lnqty:        qty ?? 1,
            lcgrade_uq:   nullIfEmpty(grade_uq),
            lccolor_uq:   nullIfEmpty(color_uq),
            lcnotes:      notes ?? "",
            lcunit:       unit ?? "",
        });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
