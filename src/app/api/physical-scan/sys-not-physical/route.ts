import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/physical-scan/sys-not-physical?page=1&size=50
export async function GET(req: NextRequest) {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const size = parseInt(req.nextUrl.searchParams.get("size") || "50");
    try {
        const r = await executeProcedure("sp_NC_real_inventory_system_not_physical", {
            lnPageNumber: page,
            lnRowsOfPage: size,
        });
        const rows = r.recordset ?? [];
        return NextResponse.json({ rows, page, size });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
