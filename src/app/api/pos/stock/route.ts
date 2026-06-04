import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/stock?page=1&size=50&search=&sort_col=&sort_dir=ASC&warehouse_uq=%&customer_uq=%&physical_uq=%
// sp_flower_NC_stock_salesman_warehouse_with_customer
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const page        = parseInt(req.nextUrl.searchParams.get("page")         || "1");
        const size        = parseInt(req.nextUrl.searchParams.get("size")         || "50");
        const search      = req.nextUrl.searchParams.get("search")       || "";
        const sortCol     = req.nextUrl.searchParams.get("sort_col")     || "";
        const sortDir     = req.nextUrl.searchParams.get("sort_dir")     || "ASC";
        const warehouseUq = req.nextUrl.searchParams.get("warehouse_uq") || "%";
        const customerUq  = req.nextUrl.searchParams.get("customer_uq")  || "%";
        const physicalUq  = req.nextUrl.searchParams.get("physical_uq")  || "%";
        const userId      = (session.user as any).id ?? "";

        const r = await executeProcedure("sp_flower_NC_stock_salesman_warehouse_with_customer", {
            lnPageNumber:  page,
            lnRowsOfPage:  size,
            Salesman_uq:   userId,
            descripcion:   search,
            lcSortColumn:  sortCol,
            lcSortOrder:   sortDir,
            warehouse_uq:  warehouseUq,
            lccustomer_uq: customerUq,
            lcwphysical_uq: physicalUq,
        });
        const rows  = r.recordset ?? [];
        const total = rows[0]?.QueryTotalRecords ?? rows[0]?.QUERYTOTALRECORDS ?? rows.length;
        return NextResponse.json({ rows, total, page, size });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
