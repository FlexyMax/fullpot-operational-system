import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
type P = { params: Promise<{ unico: string }> };

export async function PUT(_req: Request, { params }: P) {
    const { unico } = await params;
    try {
        const r = await executeProcedure("sp_flower_income_void", { lcincome_uq: unico });
        const row = r.recordset?.[0];
        if (row?.error) return NextResponse.json({ success: false, error: row.message }, { status: 400 });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
