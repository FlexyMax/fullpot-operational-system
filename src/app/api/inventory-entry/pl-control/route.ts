import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

// GET /api/inventory-entry/pl-control?date=2026-05-27
// Strategy: sp_flower_awb_by_date → list of awbcodes for the date,
//           then sp_flower_packing_x_awb for each awbcode in parallel.
export async function GET(req: NextRequest) {
    const date = req.nextUrl.searchParams.get("date");
    const lddate = new Date(date || new Date().toISOString().split("T")[0]);
    try {
        const awbResult = await executeProcedure("sp_flower_awb_by_date", { lddate });
        const awbCodes: string[] = (awbResult.recordset ?? [])
            .map((r: any) => String(r.awbcode ?? r.AWBCODE ?? "").trim())
            .filter(Boolean);

        if (awbCodes.length === 0) return NextResponse.json([]);

        const packingArrays = await Promise.all(
            awbCodes.map(awbcode =>
                executeProcedure("sp_flower_packing_x_awb", { awbcode, lddate })
                    .then(r => r.recordset ?? [])
                    .catch(() => [])
            )
        );

        return NextResponse.json(packingArrays.flat());
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
