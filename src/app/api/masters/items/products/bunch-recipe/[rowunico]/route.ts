import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, getFullpotPool } from "@/lib/db";

const nullIfEmpty = (v: any) => (v === "" || v == null) ? null : v;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ rowunico: string }> }) {
    const { rowunico } = await params;
    try {
        const pool = await getFullpotPool();
        const r = await pool.request()
            .input("unico", rowunico)
            .query("SELECT * FROM flower_products_composition WHERE unico = @unico");
        return NextResponse.json(r.recordset?.[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ rowunico: string }> }) {
    const { rowunico } = await params;
    const { product_uq, variety_uq, qty, grade_uq, color_uq, notes, unit } = await req.json();
    if (!variety_uq) return NextResponse.json({ success: false, error: "Variety is required" }, { status: 400 });
    try {
        await executeProcedure("sp_flower_products_composition_update", {
            lcunico:      rowunico,
            lcproduct_uq: product_uq,
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ rowunico: string }> }) {
    const { rowunico } = await params;
    try {
        await executeProcedure("sp_flower_products_composition_delete", { lcunico: rowunico });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
