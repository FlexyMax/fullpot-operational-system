import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { customer_uq, email, html } = await req.json();
    if (!customer_uq || !email) {
        return NextResponse.json({ success: false, error: "Missing customer or email." }, { status: 400 });
    }
    // TODO: integrate with email service (SMTP, SendGrid, Resend, etc.)
    // For now, return a placeholder success so the UI flow is complete.
    console.log(`[Statement Email] customer=${customer_uq} to=${email} htmlLength=${html?.length ?? 0}`);
    return NextResponse.json({ success: true, message: "Email service not yet configured. Statement logged for manual send." });
}
