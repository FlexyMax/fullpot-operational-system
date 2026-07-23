import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { executeProcedure } from "@/lib/db";
import { getCompanyInfo } from "@/lib/reports/companyInfo";
import { PaymentAuthPDF } from "@/components/reports/PaymentAuthPDF";

// SP: sp_flower_growers_payments_report  param: lcoutcome_uq
// Returns one row per invoice linked to the payment authorization (lowercase keys)

export async function GET(req: NextRequest) {
    const sp         = req.nextUrl.searchParams;
    const outcome_uq = sp.get("outcome_uq") ?? "";
    if (!outcome_uq) return new Response("outcome_uq required", { status: 400 });

    const [r, company] = await Promise.all([
        executeProcedure("sp_flower_growers_payments_report", { lcoutcome_uq: outcome_uq }),
        getCompanyInfo(),
    ]);

    const rows   = r.recordset ?? [];
    const docNo  = String(rows[0]?.out_document ?? outcome_uq).trim();
    const fname  = `payment_auth_${docNo || outcome_uq}.pdf`;

    const buffer = await renderToBuffer(
        <PaymentAuthPDF company={company} rows={rows} outcomeUq={outcome_uq} />
    );
    return new Response(new Uint8Array(buffer), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${fname}"`,
        },
    });
}
