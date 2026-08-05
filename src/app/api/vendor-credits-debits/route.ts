import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "2495F7A8";
const TABLA = "flower_accounts_pay_crdb";

export async function POST(req: NextRequest) {
    const body = await req.json();
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_cr_insert", {
            lctype:       body.lctype,
            ldcd_date:    body.ldcd_date,
            lcacc_pay_uq: body.lcacc_pay_uq,
            lcreason_uq:  body.lcreason_uq,
            lncd_ammount: body.lncd_ammount,
            lcdetails:    body.lcdetails ?? "",
        });
        const row   = r.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message || "Error inserting record" }, { status: 400 });
        const unico = row?.unico ?? row?.UNICO ?? "";
        serverAuditLog(PANTA, "Insert", TABLA, unico).catch(() => {});
        return NextResponse.json({ success: true, unico, message: row?.Message || "Credit/Debit created." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

