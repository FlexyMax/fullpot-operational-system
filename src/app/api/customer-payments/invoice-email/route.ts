import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import nodemailer from "nodemailer";

function createTransporter() {
    return nodemailer.createTransport({
        host:   process.env.EMAIL_HOST,
        port:   parseInt(process.env.EMAIL_PORT || "587"),
        secure: false,
        auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        connectionTimeout: 10000,
        greetingTimeout:   8000,
        socketTimeout:     15000,
    });
}

export async function POST(req: NextRequest) {
    const { invoice_uq, email, customer_name } = await req.json();
    if (!invoice_uq || !email) return NextResponse.json({ success: false, error: "Missing invoice_uq or email." }, { status: 400 });

    const safe = String(invoice_uq).replace(/[^a-zA-Z0-9]/g, "").substring(0, 8);

    try {
        const r = await executeProcedure("sp_NC_HTML_Invoice_Report_New", { lcInvoice_uq: safe });
        const row = r.recordset?.[0];
        const html = row?.InvoiceHTML ?? row?.HTMLCode ?? row?.html ?? row?.HtmlCode ?? "";
        if (!html) return NextResponse.json({ success: false, error: "Invoice not found." }, { status: 404 });

        const name = customer_name || "Customer";
        const transporter = createTransporter();
        await transporter.sendMail({
            from:    `"FullPot AR" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to:      email,
            subject: `Invoice — ${name}`,
            html:    `<p>Dear ${name},</p><p>Please find your invoice below.</p><hr/>${html}`,
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[invoice-email]", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
