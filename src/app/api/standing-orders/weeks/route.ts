import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/standing-orders/weeks?so_uq=XXX — load all 53 weeks
export async function GET(req: NextRequest) {
    const so_uq = req.nextUrl.searchParams.get("so_uq") ?? "";
    if (!so_uq) return NextResponse.json({ error: "so_uq required" }, { status: 400 });
    try {
        const calls = Array.from({ length: 53 }, (_, i) =>
            executeProcedure("sp_flower_standing_orders_weeks_uq", {
                lcso_uq: so_uq,
                lnweek:  i + 1,
            }).then(r => r.recordset?.[0] ?? null)
        );
        const results = await Promise.all(calls);
        return NextResponse.json(
            results.map((row, i) => ({
                week:   i + 1,
                unico:  row?.unico        ?? null,
                active: row?.sorder_active ?? true,
            }))
        );
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// PUT /api/standing-orders/weeks — update one week OR bulk (odd/even all)
export async function PUT(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const b = await req.json();
        if (b.bulk) {
            // bulk: { so_uq, active, odd } — uses sp_flower_standing_orders_weeks_update_all
            await executeProcedure("sp_flower_standing_orders_weeks_update_all", {
                lcso_uq:  b.so_uq,
                llactive: b.active,
                llpar:    b.odd ?? true,
            });
        } else {
            // single: { unico, active } — uses sp_flower_standing_orders_weeks_update
            await executeProcedure("sp_flower_standing_orders_weeks_update", {
                lcunico:  b.unico,
                llactive: b.active,
            });
        }
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
