import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { storeCode } from "@/lib/authCodes";
import { sendVerificationCode } from "@/lib/mailer";

export async function POST(req: NextRequest) {
    const { username, password } = await req.json();
    if (!username || !password) {
        return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    try {
        const result = await executeProcedure("sp_flexy_login", {
            lcUserName: username,
            lcPassword: password,
        }, true);

        if (!result.recordset?.[0]) {
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
        }

        const { unico, name, email: rawEmail } = result.recordset[0];

        if (!rawEmail) {
            return NextResponse.json({ error: "No email address on file for this account. Contact your administrator." }, { status: 400 });
        }

        // DB may store multiple comma-separated emails — use only the first one
        const email = String(rawEmail).split(",")[0].trim();

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        storeCode(username, code, unico, name || username, email);

        // Race email send against a 20s timeout so the API never hangs forever
        const emailResult = await Promise.race([
            sendVerificationCode(email, code, name || username).then(() => ({ ok: true })),
            new Promise<{ ok: false; error: string }>(resolve =>
                setTimeout(() => resolve({ ok: false, error: "Email timeout — check docker logs for the code" }), 20000)
            ),
        ]);

        if (!emailResult.ok) {
            console.error(`[send-code] Email timed out for ${username}. Code: ${code}`);
            return NextResponse.json({ error: (emailResult as any).error }, { status: 500 });
        }

        const [local, domain] = (email as string).split("@");
        const masked = local.slice(0, 2) + "***@" + domain;

        return NextResponse.json({ success: true, maskedEmail: masked });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Authentication error" }, { status: 500 });
    }
}
