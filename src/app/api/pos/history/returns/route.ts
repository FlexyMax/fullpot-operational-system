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

        const query = `EXEC sp_flower_invoice_history_returns '${invoice_uq.replace(/'/g, "''")}'`;

        const result = await executeQuery(query);

        return NextResponse.json(result.recordset || []);
    } catch (error: any) {
        console.error("History Returns error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
