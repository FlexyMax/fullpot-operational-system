import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";
const PANTA = "52961702";

// GET ?acc_payd_uq=...
export async function GET(req: NextRequest) {
    const acc_payd_uq = req.nextUrl.searchParams.get("acc_payd_uq") ?? "";
    if (!acc_payd_uq) return NextResponse.json({ error: "acc_payd_uq required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_x_outcome", {
            lcAcc_payd_uq: acc_payd_uq,
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST { outcome_uq, out_ammount, acc_payd_uq }
export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        const r = await executeProcedure("sp_flower_accounts_outcome_details_insert", {
            outcome_uq:  body.outcome_uq  ?? "",
            out_ammount: body.out_ammount ?? 0,
            acc_payd_uq: body.acc_payd_uq ?? "",
        });
        const rec = r.recordset[0] ?? null;
        serverAuditLog(PANTA, "Insert", "flower_accounts_outcome_details", rec?.unico ?? body.outcome_uq).catch(() => {});
        return NextResponse.json({ success: true, data: rec });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// PUT { unico, outcome_uq, out_ammount, acc_payd_uq }
export async function PUT(req: NextRequest) {
    const body = await req.json();
    if (!body.unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const r = await executeProcedure("sp_flower_accounts_outcome_details_update", {
            lcunico:     body.unico       ?? "",
            outcome_uq:  body.outcome_uq  ?? "",
            out_ammount: body.out_ammount ?? 0,
            acc_payd_uq: body.acc_payd_uq ?? "",
        });
        serverAuditLog(PANTA, "Edit", "flower_accounts_outcome_details", body.unico).catch(() => {});
        return NextResponse.json({ success: true, data: r.recordset[0] ?? null });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

// DELETE { unico }
export async function DELETE(req: NextRequest) {
    const body = await req.json();
    if (!body.unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        await executeProcedure("sp_flower_accounts_outcome_details_delete", {
            lcunico: body.unico,
        });
        serverAuditLog(PANTA, "Delete", "flower_accounts_outcome_details", body.unico).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
