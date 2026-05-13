import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_up", { lcinvoice_uq: unico });
        return NextResponse.json(result.recordset[0] ?? null);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_insert", {
            ldap_date:        body.ldap_date,
            lcsupplier_uq:    body.lcsupplier_uq,
            lcinvoice_no:     body.lcinvoice_no,
            lcterms_uq:       body.lcterms_uq    || "",
            lnestimated:      body.lnestimated   ?? 0,
            lntaxes:          body.lntaxes        ?? 0,
            lnamount:         body.lnamount       ?? 0,
            lnporder_no:      body.lnporder_no    ?? 0,
            lcdescription:    body.lcdescription  || "",
            llautomatic:      body.llautomatic    ? 1 : 0,
            llindirect:       body.llindirect     ? 1 : 0,
            llautomatic_cost: body.llautomatic_cost ? 1 : 0,
        });
        return NextResponse.json({ success: true, data: result.recordset[0] ?? null });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    if (!body.lcunico) return NextResponse.json({ error: "lcunico required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_update", {
            lcunico:          body.lcunico,
            ldap_date:        body.ldap_date,
            lcsupplier_uq:    body.lcsupplier_uq,
            lcinvoice_no:     body.lcinvoice_no,
            lcterms_uq:       body.lcterms_uq    || "",
            lnestimated:      body.lnestimated   ?? 0,
            lntaxes:          body.lntaxes        ?? 0,
            lnamount:         body.lnamount       ?? 0,
            lnporder_no:      body.lnporder_no    ?? 0,
            lcdescription:    body.lcdescription  || "",
            llautomatic:      body.llautomatic    ? 1 : 0,
            llindirect:       body.llindirect     ? 1 : 0,
            llautomatic_cost: body.llautomatic_cost ? 1 : 0,
        });
        return NextResponse.json({ success: true, data: result.recordset[0] ?? null });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ error: "unico required" }, { status: 400 });
    try {
        await executeProcedure("sp_flower_accounts_pay_delete", { lcunico: unico });
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
