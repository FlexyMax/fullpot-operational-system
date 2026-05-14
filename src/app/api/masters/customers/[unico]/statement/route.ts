import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { todayEST } from "@/lib/dates";

export async function GET(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const from = req.nextUrl.searchParams.get("from") || todayEST();
    const to   = req.nextUrl.searchParams.get("to")   || todayEST();
    try {
        const r = await executeProcedure("sp_flower_accounts_rec_statment_balance", {
            Customer:     unico,
            ldStart_date: new Date(from + "T00:00:00"),
            ldEnd_date:   new Date(to   + "T23:59:59"),
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
