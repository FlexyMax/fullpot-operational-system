import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { htmlToPdfBuffer } from "@/lib/pdf";
import nodemailer from "nodemailer";

function createTransporter() {
    return nodemailer.createTransport({
        host:   process.env.EMAIL_HOST,
        port:   parseInt(process.env.EMAIL_PORT || "587"),
        secure: false,
        auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        connectionTimeout: 10000,
        greetingTimeout:   8000,
        socketTimeout:     30000,
    });
}

export async function POST(req: NextRequest) {
    const { invoice_uq, email, customer_name, invoice_no } = await req.json();
    if (!invoice_uq || !email) return NextResponse.json({ success: false, error: "Missing invoice_uq or email." }, { status: 400 });

    const safe = String(invoice_uq).replace(/[^a-zA-Z0-9]/g, "").substring(0, 8);

    try {
        const r = await executeProcedure("sp_NC_HTML_Invoice_Report_New", { lcInvoice_uq: safe, llPrint: 0 });
        const row = r.recordset?.[0];
        const html = row?.InvoiceHTML ?? row?.HTMLCode ?? row?.html ?? "";
        if (!html) return NextResponse.json({ success: false, error: "Invoice not found." }, { status: 404 });

        const pdfBuffer = await htmlToPdfBuffer(html);
        const invNo     = String(invoice_no ?? safe).trim();
        const name      = String(customer_name ?? "Customer").trim();

        const transporter = createTransporter();
        await transporter.sendMail({
            from:    `"FullPot AR" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to:      email,
            subject: `Invoice #${invNo} — FullPot`,
            html:    `<p>Dear ${name},</p><p>Please find your invoice #${invNo} attached.</p>`,
            attachments: [{ filename: `Invoice_${invNo}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
        });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("[invoice-email]", err.message);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
