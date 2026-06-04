import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/customers?page=1&size=50&search=XXX
// sp_NC_customers_call_list(@lnPageNumber, @lnRowsOfPage, @lndia, @lcuser_uq, @lcsearch)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const page   = parseInt(req.nextUrl.searchParams.get("page")   || "1");
        const size   = parseInt(req.nextUrl.searchParams.get("size")   || "50");
        const search = req.nextUrl.searchParams.get("search") || "";
        // Accept explicit user_uq from client (from sp_flower_salesman_uq → user_uq)
        // so the SP sees the correct salesman's user identity, not just the auth token id
        const userId = req.nextUrl.searchParams.get("user_uq") || (session.user as any).id || "";
        const r = await executeProcedure("sp_NC_customers_call_list", {
            lnPageNumber: page,
            lnRowsOfPage: size,
            lndia:        0,
            lcuser_uq:    userId,
            lcsearch:     search,
        });
        const rows  = r.recordset ?? [];
        const total = rows[0]?.QueryTotalRecords ?? rows[0]?.QUERYTOTALRECORDS ?? rows.length;
        return NextResponse.json({ rows, total, page, size });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
