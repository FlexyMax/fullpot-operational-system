import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ pack_uq: string }> };

// POST /api/inventory-entry/packings/[pack_uq]/action
// body: { action: "open"|"close"|"reception" }
export async function POST(req: NextRequest, { params }: P) {
    const { pack_uq } = await params;
    const b = await req.json();
    const action: string = b.action ?? "";
    try {
        let r: any;
        switch (action) {
            case "open":
                r = await executeProcedure("sp_flower_packing_open", { lcpacking_uq: pack_uq });
                break;
            case "close":
                r = await executeProcedure("sp_flower_packing_close", { lcpacking_uq: pack_uq });
                break;
            case "reception":
                r = await executeProcedure("sp_flower_packing_reception", { lcpack_uq: pack_uq });
                break;
            default:
                return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
        }
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1) return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? row?.UNICO });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
