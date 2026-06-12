import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const ap_uq = req.nextUrl.searchParams.get("ap_uq");
    if (!ap_uq) return NextResponse.json({ error: "ap_uq required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_total_pobs", { lcap_uq: ap_uq });
        return NextResponse.json(result.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { ap_uq, pob_uq, cost, ap_type_uq } = await req.json();
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_pob_insert", {
            lcap_uq:    ap_uq,
            lcpob_uq:   pob_uq,
            lncost:     cost,
            lcaptype_uq: ap_type_uq
        });
        const row = result.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Business rule violation" }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico ?? null, message: "PO record added." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const { unico, pob_uq, cost, ap_type_uq } = await req.json();
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_pob_update", {
            lcunico:     unico,
            lcpob_uq:    pob_uq,
            lncost:      cost,
            lcaptype_uq: ap_type_uq
        });
        const row = result.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Business rule violation" }, { status: 400 });
        return NextResponse.json({ success: true, unico, message: "PO record updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ success: false, error: "unico required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_pob_delete", { lcunico: unico });
        const row = result.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Business rule violation" }, { status: 400 });
        return NextResponse.json({ success: true, unico, message: "PO record deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
