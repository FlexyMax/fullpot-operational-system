import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ pack_uq: string }> };

export async function POST(req: NextRequest, { params }: P) {
    const { pack_uq } = await params;
    const b = await req.json();
    try {
        const r = await executeProcedure("sp_flower_packing_copy", {
            lcpacking_uq: pack_uq,
            date_invo:    b.date_invo  ? new Date(b.date_invo)  : new Date(),
            ldcut_off:    b.ldcut_off  ? new Date(b.ldcut_off)  : new Date(),
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        const newUnico = row?.UNICO ?? row?.unico ?? row?.NEW_UNICO ?? null;
        return NextResponse.json({ success: true, unico: newUnico });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
