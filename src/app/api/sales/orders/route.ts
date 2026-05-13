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
        let sales_rep_uq = searchParams.get("sales_rep_uq") || '%';

        if (!date) {
            return NextResponse.json([]);
        }

        if (sales_rep_uq === 'undefined' || sales_rep_uq === 'null') {
            sales_rep_uq = '%';
        }

        const txt = (val: string | null) => (val || '').replace(/'/g, "''");

        // EXEC sp_NC_invoice_list 'date', 'sales_rep_uq', 1, ''
        const query = `EXEC sp_NC_invoice_list '${txt(date)}', '${txt(sales_rep_uq)}', 1, ''`;

        const result = await executeQuery(query);

        return NextResponse.json(result.recordset || []);
    } catch (error: any) {
        console.error("Orders list error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
