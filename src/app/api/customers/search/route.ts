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
        const page = parseInt(searchParams.get("page") || "1");

        const result = await executeProcedure("sp_NC_customers_call_list", {
            lnpage: page,
            lnpageSize: 50,
            lnparam: 0,
            lcUser_uq: (session.user as any).id,
            lcsearch: search,
        }, true); // SISTEMA DB for customers usually

        return NextResponse.json({ success: true, customers: result.recordset });
    } catch (error: any) {
        console.error("Customer Search error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
