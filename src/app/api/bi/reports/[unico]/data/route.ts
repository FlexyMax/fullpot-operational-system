import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { executeProcedure, getFullpotPool } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const t = (v: any) => String(v ?? "").trim();

// Names come from the flower_store_procedures catalog, never straight from the client —
// this allowlist is defense-in-depth before the name is interpolated into EXEC.
const VALID_SP_NAME = /^[A-Za-z0-9_]+$/;

const bodySchema = z.object({
    fechaInicio: z.string().min(1),
    fechaFin:    z.string().min(1),
});

type P = { params: Promise<{ unico: string }> };

// POST /api/bi/reports/:unico/data
// Resolves :unico against sp_flower_store_procedures (active reports only), then runs the
// matched stored procedure positionally — EXEC [proc] @p1, @p2 — so it works regardless of
// what each report's own SP names its two date parameters internally.
export async function POST(req: NextRequest, { params }: P) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { unico } = await params;
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: "fechaInicio and fechaFin are required" }, { status: 400 });
    }

    const fechaInicio = new Date(parsed.data.fechaInicio);
    const fechaFin    = new Date(parsed.data.fechaFin);
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    try {
        const catalog = await executeProcedure("sp_flower_store_procedures", {});
        const report = (catalog.recordset ?? []).find((row: any) => t(row.unico) === t(unico));
        if (!report) {
            return NextResponse.json({ error: "Report not found or inactive" }, { status: 404 });
        }

        const spName = t(report.store_procedure);
        if (!VALID_SP_NAME.test(spName)) {
            return NextResponse.json({ error: "Invalid report configuration" }, { status: 400 });
        }

        const pool    = await getFullpotPool();
        const request = pool.request();
        request.input("p1", fechaInicio);
        request.input("p2", fechaFin);

        const result = await request.query(`EXEC [${spName}] @p1, @p2`);
        const rows    = result.recordset ?? [];
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

        return NextResponse.json({ columns, rows, rowCount: rows.length });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
