import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/physical-scan/scanned-boxes?page=1&size=50
export async function GET(req: NextRequest) {
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const size = parseInt(req.nextUrl.searchParams.get("size") || "50");
    try {
        const r = await executeProcedure("sp_NC_physical_inventory_scanned_boxes_web", {
            lnPageNumber: page,
            lnRowsOfPage: size,
        });
        return NextResponse.json({ rows: r.recordset ?? [], page, size });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
