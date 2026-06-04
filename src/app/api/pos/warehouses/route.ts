import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/pos/warehouses?physical_uq=XXX
// sp_flower_salesman_warehouses_with_all(@lcuser_uq, @llall, @lcwphysical_uq)
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const userId      = (session.user as any).id ?? "";
        const physicalUq  = req.nextUrl.searchParams.get("physical_uq") || "%";
        const r = await executeProcedure("sp_flower_salesman_warehouses_with_all", {
            lcuser_uq:     userId,
            llall:         1,
            lcwphysical_uq: physicalUq,
        });
        return NextResponse.json(r.recordset ?? []);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
