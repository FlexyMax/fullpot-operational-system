import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { todayEST } from "@/lib/dates";

export async function GET(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const from = req.nextUrl.searchParams.get("from") || todayEST();
    const to   = req.nextUrl.searchParams.get("to")   || todayEST();
    try {
        const result = await executeProcedure("sp_sistema_bitacora", {
            lcuser_uq: unico,
            ldstart:   new Date(from + "T00:00:00"),
            ldend:     new Date(to   + "T23:59:59"),
        }, true);
        return NextResponse.json(result.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
