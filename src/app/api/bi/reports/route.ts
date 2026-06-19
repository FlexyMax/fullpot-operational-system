import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const t = (v: any) => String(v ?? "").trim();

// GET /api/bi/reports
// Lists active BI reports from the flower_store_procedures catalog (sp_flower_store_procedures).
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const r = await executeProcedure("sp_flower_store_procedures", {});
        const reports = (r.recordset ?? []).map((row: any) => ({
            unico:          t(row.unico),
            storeProcedure: t(row.store_procedure),
            title:          t(row.Sp_tittle),
            description:    t(row.description) || null,
        }));
        return NextResponse.json(reports);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
