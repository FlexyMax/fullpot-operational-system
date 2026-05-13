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
        const date = searchParams.get("date");
        const salesman_uq = searchParams.get("salesman_uq");

        if (!date) {
            return NextResponse.json([]);
        }

        const txt = (val: string | null) => (val || '').replace(/'/g, "''");

        // EXEC sp_NC_sales_by_salesman_by_day 'date', 1, 'salesman_uq', ''
        const query = `EXEC sp_NC_sales_by_salesman_by_day '${txt(date)}', 1, '${txt(salesman_uq)}', ''`;

        const result = await executeQuery(query);

        return NextResponse.json(result.recordset || []);
    } catch (error: any) {
        console.error("Sales by rep error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
