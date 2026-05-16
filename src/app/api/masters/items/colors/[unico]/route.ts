import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
const bit = (v: any) => (v ? 1 : 0);
type P = { params: Promise<{ unico: string }> };

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        await executeQuery(`
            UPDATE flower_varieties_colors SET color='${txt(b.color)}', color_sh='${txt(b.color_sh)}',
                display=${bit(b.display)}, mix=${bit(b.mix)} WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Color updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        await executeQuery(`DELETE FROM flower_varieties_colors WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Color deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
