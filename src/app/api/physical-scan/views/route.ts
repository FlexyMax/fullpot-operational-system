import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

const VIEW_MAP: Record<string, string> = {
    "in-transit":          "sp_flower_real_inventory_in_transit",
    "scanned-equal":       "sp_flower_real_inventory_scanned_equal_physical",
    "scanned-boxes":       "sp_flower_physical_inventory_scanned_boxes_web",
    "system-not-physical": "sp_flower_real_inventory_system_not_physical",
    "system-less-physical":"sp_flower_real_inventory_system_less_physical",
    "system-equal-physical":"sp_flower_real_inventory_system_equal_physical",
    "physical-less-system":"sp_flower_real_inventory_physical_less_system",
    "physical-not-system": "sp_flower_real_inventory_physical_not_system",
};

// GET /api/physical-scan/views?v=in-transit
export async function GET(req: NextRequest) {
    const v = req.nextUrl.searchParams.get("v") ?? "";
    const sp = VIEW_MAP[v];
    if (!sp) return NextResponse.json({ error: `Unknown view: ${v}` }, { status: 400 });
    try {
        const r = await executeProcedure(sp, {});
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
