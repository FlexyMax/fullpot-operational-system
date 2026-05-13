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
        const year = searchParams.get("year") || new Date().getFullYear();
        const salesman_uq = searchParams.get("salesman_uq") || '%';
        const user_uq = searchParams.get("user_uq") || '%';

        // EXEC sp_NC_invoice_dates 1, 400, 'year', 1, '%'
        const query = `EXEC sp_NC_invoice_dates 1, 400, '${year}', 1, '%'`;

        const result = await executeQuery(query);

        return NextResponse.json(result.recordset || []);
    } catch (error: any) {
        console.error("Sales Dates error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
