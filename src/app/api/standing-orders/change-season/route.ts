import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "XD6Z7064";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { so_uq, season_uq, salesman_uq } = await req.json();
        if (!so_uq || !season_uq)
            return NextResponse.json({ error: "so_uq and season_uq required" }, { status: 400 });
        const r = await executeProcedure("sp_flower_standing_orders_header_update_season", {
            lcunico:       so_uq,
            lcseason_uq:   season_uq,
            lcsalesman_uq: salesman_uq ?? "",
        });
        const row = r.recordset?.[0];
        if (row?.error === 1 || row?.Error === 1)
            return NextResponse.json({ success: false, error: row.message || row.Message }, { status: 400 });
        serverAuditLog(PANTA, "Edit", "flower_sales_orders", so_uq, "Change Season").catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
