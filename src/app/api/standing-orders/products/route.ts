import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/standing-orders/products
//   ?q=search           → search term (for LineModal debounce, uses sp_flower_boxes_list, limit 60)
//   ?page=1&size=50     → paginated mode (uses sp_NC_prebook_products_list, returns { rows, total })
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");

    if (page !== null) {
        // Paginated mode for ProductsListModal
        const pageNum  = parseInt(page || "1");
        const pageSize = parseInt(searchParams.get("size") || "50");
        const search   = searchParams.get("q") ?? "";
        try {
            const r = await executeProcedure("sp_NC_prebook_products_list", {
                lnPageNumber:  pageNum,
                lnRowsOfPage:  pageSize,
                lcdescription: search,
            });
            const rows  = r.recordset ?? [];
            const total = rows.length > 0 ? Number(rows[0].QueryTotalRecords ?? rows[0].TOTAL_RECORDS ?? rows.length) : 0;
            return NextResponse.json({ rows, total, page: pageNum, pageSize });
        } catch (err: any) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    }

    // Simple search mode for LineModal / BoxCompositionModal debounce
    const q    = searchParams.get("q") ?? "";
    const desc = q ? `%${q}%` : "%";
    try {
        const r = await executeProcedure("sp_flower_boxes_list", {
            lcdescription: desc,
            lcshort:       "%",
            lcold_code:    "%",
        });
        const limit = parseInt(searchParams.get("limit") ?? "60");
        const rows = (r.recordset ?? []).slice(0, limit);
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
