import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { todayEST } from "@/lib/dates";

export async function GET(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const sp       = req.nextUrl.searchParams;
    const from     = sp.get("from")     || todayEST();
    const to       = sp.get("to")       || todayEST();
    const page     = Math.max(1, parseInt(sp.get("page")     || "1"));
    const pageSize = Math.max(1, parseInt(sp.get("pageSize") || "20"));

    try {
        const result = await executeProcedure("sp_NC_sistema_bitacora", {
            lcuser_uq:  unico,
            ldstart:    new Date(from + "T00:00:00"),
            ldend:      new Date(to   + "T23:59:59"),
            lnPage:     page,
            lnPageSize: pageSize,
        }, true);

        const total = (result.recordsets[0]?.[0] as any)?.TotalRecords ?? 0;
        const data  = result.recordsets[1] ?? [];

        return NextResponse.json({ data, total, page, pageSize });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
