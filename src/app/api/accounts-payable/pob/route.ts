import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const ap_uq = req.nextUrl.searchParams.get("ap_uq");
    if (!ap_uq) return NextResponse.json({ error: "ap_uq required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_total_pobs", [
            { name: "ap_uq", value: ap_uq }
        ]);
        return NextResponse.json(result.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { ap_uq, pob_uq, cost, ap_type_uq } = body;
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_pob_insert", [
            { name: "ap_uq",      value: ap_uq },
            { name: "pob_uq",     value: pob_uq },
            { name: "cost",       value: cost },
            { name: "ap_type_uq", value: ap_type_uq }
        ]);
        return NextResponse.json({ success: true, data: result.recordset[0] });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { unico, pob_uq, cost, ap_type_uq } = body;
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_pob_update", [
            { name: "unico",      value: unico },
            { name: "pob_uq",     value: pob_uq },
            { name: "cost",       value: cost },
            { name: "ap_type_uq", value: ap_type_uq }
        ]);
        return NextResponse.json({ success: true, data: result.recordset[0] });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        await executeProcedure("sp_flower_accounts_pay_pob_delete", [
            { name: "unico", value: unico }
        ]);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
