import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const warehouse = searchParams.get("warehouse") || "%";
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "100");

        const result = await executeProcedure("sp_flower_NC_stock_salesman_warehouse_with_customer", {
            lnPageNumber: page,
            lnRowsOfPage: pageSize,
            Salesman_uq: (session.user as any).id || '%',
            descripcion: search,
            lcSortColumn: '',
            lcSortOrder: 'null',
            warehouse_uq: '%',
            lccustomer_uq: '%',
            lcwphysical_uq: warehouse || '%'
        });

        const stock = result.recordset || [];
        return NextResponse.json({ success: true, stock });
    } catch (error: any) {
        console.error("Stock Search error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
