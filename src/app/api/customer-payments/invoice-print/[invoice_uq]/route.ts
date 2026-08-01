import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(_req: NextRequest, context: { params: Promise<{ invoice_uq: string }> }) {
    const { invoice_uq } = await context.params;
    const safe = String(invoice_uq).replace(/[^a-zA-Z0-9]/g, "").substring(0, 8);
    if (!safe) return NextResponse.json({ error: "invoice_uq required" }, { status: 400 });

    try {
        const r = await executeProcedure("sp_NC_HTML_Invoice_Report_New", { lcInvoice_uq: safe });
        const row = r.recordset?.[0];
        const html = row?.InvoiceHTML ?? row?.HTMLCode ?? row?.html ?? row?.HtmlCode ?? "";
        if (!html) return new Response("<p>Invoice not found or no HTML output.</p>", { headers: { "Content-Type": "text/html" } });
        return new Response(String(html), {
            headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
