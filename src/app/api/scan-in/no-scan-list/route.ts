import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { executeProcedure } from "@/lib/db";

// GET /api/scan-in/no-scan-list?awb=XXX
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const awb = req.nextUrl.searchParams.get("awb")?.trim().toUpperCase();
    if (!awb) return NextResponse.json({ error: "AWB code required" }, { status: 400 });

    try {
        const result = await executeProcedure("sp_flower_packing_awb_noreception_list", { awb_code: awb });
        return NextResponse.json(result.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
