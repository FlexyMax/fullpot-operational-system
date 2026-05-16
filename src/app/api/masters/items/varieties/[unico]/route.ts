import { NextRequest, NextResponse } from "next/server";
import { executeProcedure, executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function GET(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_variety_uq", { lcunico: unico });
        return NextResponse.json(r.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        await executeQuery(`
            UPDATE flower_varieties SET
                variety='${txt(b.variety)}', variety_sh='${txt(b.variety_sh)}',
                color_uq='${txt(b.color_uq)}', display=${bit(b.display)},
                changecolor=${bit(b.changecolor)}, active=${bit(b.active !== false)}
            WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Variety updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        // Check if variety has products
        const chk = await executeQuery(`SELECT COUNT(*) total FROM flower_products WHERE variety_uq='${txt(unico)}'`);
        const total = chk.recordset[0]?.total ?? 0;
        if (total > 0) return NextResponse.json({ success: false, error: `There are ${total} products for this variety. Remove them first.` }, { status: 400 });
        await executeQuery(`DELETE FROM flower_varieties WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Variety deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
