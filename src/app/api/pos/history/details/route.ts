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
        const invoice_uq = searchParams.get("invoice_uq") || "";
        let salesman_uq = searchParams.get("salesman_uq") || ((session.user as any).id);

        if (!salesman_uq || salesman_uq === 'undefined' || salesman_uq === 'null') {
            salesman_uq = (session.user as any).id;
        }

        const query = `EXEC sp_flower_invoice_details_history '${invoice_uq.replace(/'/g, "''")}', '${salesman_uq.replace(/'/g, "''")}'`;

        const result = await executeQuery(query);

        return NextResponse.json(result.recordset || []);
    } catch (error: any) {
        console.error("History Details error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
