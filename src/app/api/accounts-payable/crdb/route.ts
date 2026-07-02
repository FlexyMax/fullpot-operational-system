import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const result = await executeProcedure("SP_NC_ACCOUNTS_PAY_CRDB", { lccrdb_uq: unico });
        return NextResponse.json(result.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { acc_pay_uq, type, cd_date, reason_uq, cd_ammount, retention_no, details } = body;
    try {
        const result = await executeProcedure("sp_NC_accounts_pay_crdb_insert", {
            acc_pay_uq:   acc_pay_uq   || "",
            type:         type         || "C",
            cd_date:      cd_date,
            reason_uq:    reason_uq    || "",
            cd_ammount:   parseFloat(cd_ammount) || 0,
            retention_no: (retention_no || "").substring(0, 10),
            details:      (details      || "").substring(0, 250),
        });
        const row = result.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Business rule violation" }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? null, message: row?.Message || "Credit/Debit added." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { unico, type, cd_date, reason_uq, cd_ammount, retention_no, details } = body;
    if (!unico) return NextResponse.json({ success: false, error: "unico required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_NC_accounts_pay_crdb_update", {
            unico:        unico,
            type:         type         || "C",
            cd_date:      cd_date,
            reason_uq:    reason_uq    || "",
            cd_ammount:   parseFloat(cd_ammount) || 0,
            retention_no: (retention_no || "").substring(0, 10),
            details:      (details      || "").substring(0, 250),
        });
        const row = result.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Business rule violation" }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? unico, message: row?.Message || "Credit/Debit updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ success: false, error: "unico required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_NC_accounts_pay_crdb_delete", { unico });
        const row = result.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Business rule violation" }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? unico, message: row?.Message || "Credit/Debit deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
