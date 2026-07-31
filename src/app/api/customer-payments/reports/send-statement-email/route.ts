import { NextRequest, NextResponse } from "next/server";
import { sendStatementEmail } from "@/lib/mailer";

export async function POST(req: NextRequest) {
    const { customer_uq, customer_name, email, html } = await req.json();
    if (!customer_uq || !email || !html) {
        return NextResponse.json(
            { success: false, error: "Missing customer, email, or html content." },
            { status: 400 }
        );
    }
    try {
        await sendStatementEmail(email, html, customer_name ?? customer_uq);
        return NextResponse.json({ success: true, message: "Statement sent successfully." });
    } catch (err: any) {
        console.error(`[Statement Email] customer=${customer_uq} to=${email}: ${err.message}`);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
