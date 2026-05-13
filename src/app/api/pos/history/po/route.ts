import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const year = searchParams.get("year") || new Date().getFullYear().toString();
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");

        // EXEC sp_NC_packing_box_search_in_invoice @page, @pageSize, @search, @year
        const query = `EXEC sp_NC_packing_box_search_in_invoice ${page}, 50, '${search.replace(/'/g, "''")}', '${year.replace(/'/g, "''")}'`;

        const result = await executeQuery(query);

        return NextResponse.json(result.recordset || []);
    } catch (error: any) {
        console.error("PO History error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
