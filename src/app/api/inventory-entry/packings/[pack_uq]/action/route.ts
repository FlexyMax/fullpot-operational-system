import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

type P = { params: Promise<{ pack_uq: string }> };

const str = (v: any, len = 255) => String(v ?? "").trim().substring(0, len);

// POST /api/inventory-entry/packings/[pack_uq]/action
// body: { action: "open"|"close"|"reception"|"copy"|"from_porder" }
export async function POST(req: NextRequest, { params }: P) {
    const { pack_uq } = await params;
    const b = await req.json();
    const action: string = b.action ?? "";
    try {
        let r: any;
        switch (action) {
            case "open":
                r = await executeProcedure("sp_flower_packing_open", { lcunico: pack_uq });
                break;
            case "close":
                r = await executeProcedure("sp_flower_packing_close", { lcunico: pack_uq });
                break;
            case "reception":
                r = await executeProcedure("sp_flower_packing_reception", { lcunico: pack_uq });
                break;
            case "copy":
                r = await executeProcedure("sp_flower_packing_copy", { lcunico: pack_uq, lcuser_uq: str(b.user_uq, 8) });
                break;
            case "from_porder":
                r = await executeProcedure("sp_flower_inventory_insert_from_porder", { lcawbcode: str(b.awbcode, 20) });
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
