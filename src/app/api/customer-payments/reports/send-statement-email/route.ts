import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { StatementPDF } from "@/components/reports/StatementPDF";
import { sendStatementEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
    const { customer_uq, customer_name, email, from_date, to_date, mode } = await req.json();
    if (!customer_uq || !email) {
        return NextResponse.json(
            { success: false, error: "Missing customer_uq or email." },
            { status: 400 }
        );
    }

    const fromDate  = from_date || new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
    const toDate    = to_date   || new Date().toISOString().split("T")[0];
    // "balance" mode → only open-balance transactions (sp_flower_accounts_rec_statment_balance)
    // "statement" mode → all transactions in date range (sp_flower_accounts_rec_statment)
    const spName    = mode === "balance"
        ? "sp_flower_accounts_rec_statment_balance"
        : "sp_flower_accounts_rec_statment";

    try {
        const [stmtResult, company] = await Promise.all([
            executeProcedure(spName, {
                Customer:     customer_uq,
                ldStart_date: fromDate,
                ldEnd_date:   toDate,
            }),
            getCompanyInfo(),
        ]);

        const rows = stmtResult.recordset ?? [];

        const pdfBuffer = await renderToBuffer(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            React.createElement(StatementPDF, { company, rows, fromDate, toDate }) as any
        );

        const name = customer_name || (rows[0] ? String(rows[0].customer ?? "").trim() : customer_uq);
        await sendStatementEmail(email, Buffer.from(pdfBuffer), name);

        return NextResponse.json({ success: true, message: "Statement sent successfully." });
    } catch (err: any) {
        console.error(`[Statement Email] customer=${customer_uq} to=${email}: ${err.message}`);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
