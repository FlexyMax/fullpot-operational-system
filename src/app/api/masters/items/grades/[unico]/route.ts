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
            UPDATE flower_clases_grados SET grado='${txt(b.grado)}', grade_sh='${txt(b.grade_sh)}',
                display=${bit(b.display)} WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Grade updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        await executeQuery(`DELETE FROM flower_clases_grados WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Grade deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
