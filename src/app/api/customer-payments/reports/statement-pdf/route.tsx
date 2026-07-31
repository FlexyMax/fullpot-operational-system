import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { StatementPDF } from "@/components/reports/StatementPDF";

export async function GET(req: NextRequest) {
    const sp         = req.nextUrl.searchParams;
    const customerUq = sp.get("customer_uq") ?? "";
    const mode       = (sp.get("mode") ?? "statement") as "statement" | "balance";
    const fromDate   = sp.get("from") || new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0];
    const toDate     = sp.get("to")   || new Date().toISOString().split("T")[0];

    if (!customerUq)
        return new Response(JSON.stringify({ error: "customer_uq is required." }), { status: 400 });

    const spName = mode === "balance"
        ? "sp_flower_accounts_rec_statment_balance"
        : "sp_flower_accounts_rec_statment";

    const [stmtResult, company] = await Promise.all([
        executeProcedure(spName, { Customer: customerUq, ldStart_date: fromDate, ldEnd_date: toDate }),
        getCompanyInfo(),
    ]);

    const rows = stmtResult.recordset ?? [];

    const pdfBuffer = await renderToBuffer(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        React.createElement(StatementPDF, { company, rows, fromDate, toDate, mode }) as any
    );

    return new Response(new Uint8Array(pdfBuffer), {
        headers: {
            "Content-Type":        "application/pdf",
            "Content-Disposition": `inline; filename="statement_${customerUq}.pdf"`,
        },
    });
}
