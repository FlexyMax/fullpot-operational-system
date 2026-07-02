import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "XD6Z7067";
const TABLA = "flower_accounts_pay";

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
        const row = result.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Business rule violation" }, { status: 400 });
        const unico = row?.unico ?? row?.UNICO ?? null;
        serverAuditLog(PANTA, "Insert", TABLA, unico ?? "").catch(() => {});
        return NextResponse.json({ success: true, unico, message: "Invoice created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const body = await req.json();
    if (!body.lcunico) return NextResponse.json({ success: false, error: "lcunico required" }, { status: 400 });
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
        const row = result.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Business rule violation" }, { status: 400 });
        serverAuditLog(PANTA, "Edit", TABLA, body.lcunico).catch(() => {});
        return NextResponse.json({ success: true, unico: body.lcunico, message: "Invoice updated." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const unico = req.nextUrl.searchParams.get("unico");
    if (!unico) return NextResponse.json({ success: false, error: "unico required" }, { status: 400 });
    try {
        const result = await executeProcedure("sp_flower_accounts_pay_delete", { lcunico: unico });
        const row = result.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Business rule violation" }, { status: 400 });
        serverAuditLog(PANTA, "Delete", TABLA, unico).catch(() => {});
        return NextResponse.json({ success: true, unico, message: "Invoice deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
