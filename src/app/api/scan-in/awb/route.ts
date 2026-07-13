import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { executeProcedure } from "@/lib/db";

// GET /api/scan-in/awb?code=XXX
// Seeds all boxes via insert_in_all then returns totals
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const code = req.nextUrl.searchParams.get("code")?.trim().toUpperCase();
    if (!code) return NextResponse.json({ error: "AWB code required" }, { status: 400 });

    try {
        // Seed all boxes (idempotent — SP skips already-existing rows)
        const seedR = await executeProcedure("sp_flower_packing_box_control_insert_in_all", { lcawb: code });
        const seedRow = seedR.recordset?.[0];
        if (seedRow?.Error === true || seedRow?.Error === 1) {
            return NextResponse.json({ error: String(seedRow.Message ?? "Seed failed") }, { status: 400 });
        }

        // Get totals
        const totalsR = await executeProcedure("sp_flower_packing_awb_totals", { lcawb: code });
        const row = totalsR.recordset?.[0];
        if (!row) return NextResponse.json({ error: "AWB not found" }, { status: 404 });

        return NextResponse.json({
            awbcode:     String(row.AWBCODE ?? code).trim(),
            totalPieces: Number(row.TOTAL_PIECES ?? 0),
            readPieces:  Number(row.READ_PIECES  ?? 0),
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
