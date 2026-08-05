import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "VCRD0001";
const TABLA = "flower_accounts_pay_crdb_pob";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    try {
        const [header, dists] = await Promise.all([
            executeProcedure("sp_flower_accounts_pay_crdb",     { lcap_uq: unico }),
            executeProcedure("sp_flower_accounts_pay_crdb_pob", { lcap_uq: unico }),
        ]);
        const norm = (rows: any[]) =>
            rows.map((row: any) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v])));
        return NextResponse.json({
            header:        norm(header.recordset  ?? [])[0] ?? null,
            distributions: norm(dists.recordset   ?? []),
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const body = await req.json();
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_crdb_pob_insert", {
            lcapcrdb_uq: unico,
            lcpob_uq:    body.lcpob_uq,
            lncredit_pob: body.lncredit_pob,
        });
        const row   = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        const newUnico = row?.unico ?? row?.UNICO ?? "";
        serverAuditLog(PANTA, "Insert", TABLA, newUnico).catch(() => {});
        return NextResponse.json({ success: true, unico: newUnico, message: row?.Message || "Distribution added." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
