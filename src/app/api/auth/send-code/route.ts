import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { storeCode, storePreAuth } from "@/lib/authCodes";
import { sendVerificationCode } from "@/lib/mailer";

function maskEmail(email: string): string {
    const [local, domain] = email.split("@");
    return (local || "").slice(0, 2) + "***@" + (domain || "");
}

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

        const row = result.recordset[0];
        const { unico, name } = row;
        const rawEmail: string = String(row.email || row.correo || "");

        // Parse up to 2 non-empty emails (field may be comma-separated)
        const emails = rawEmail
            .split(",")
            .map((e: string) => e.trim())
            .filter(Boolean)
            .slice(0, 2);

        // Case-insensitive U2FA lookup — mssql may return column casing differently
        const rowLC: Record<string, any> = {};
        for (const k of Object.keys(row)) rowLC[k.toLowerCase()] = row[k];
        const u2faRaw = rowLC["u2fa"];
        const u2faRequired = u2faRaw === undefined ? true : Boolean(u2faRaw);

        // ── U2FA OFF: bypass email code, issue preAuthToken directly ────────
        if (!u2faRequired) {
            const preAuthToken = storePreAuth(username, unico, name || username, emails[0] || "");
            return NextResponse.json({ success: true, u2faRequired: false, preAuthToken });
        }

        // ── U2FA ON: require at least one email address ──────────────────────
        if (emails.length === 0) {
            return NextResponse.json({
                error: "No email address on file. Contact your administrator.",
            }, { status: 400 });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        storeCode(username, code, unico, name || username, emails[0]);

        // Send to up to 2 emails in parallel; race each against a 20 s timeout
        const sendOne = (email: string) =>
            Promise.race([
                sendVerificationCode(email, code, name || username).then(() => ({ ok: true as const, email })),
                new Promise<{ ok: false; email: string }>((resolve) =>
                    setTimeout(() => resolve({ ok: false, email }), 20000)
                ),
            ]);

        const results = await Promise.all(emails.map(sendOne));
        const failed  = results.filter((r) => !r.ok);

        if (failed.length === emails.length) {
            // All sends timed out
            console.error(`[send-code] All email sends timed out for ${username}. Code: ${code}`);
            return NextResponse.json(
                { error: "Email delivery timed out — check mail server logs." },
                { status: 500 }
            );
        }

        if (failed.length > 0) {
            // Partial failure — log but continue (at least one arrived)
            console.warn(`[send-code] Some emails timed out for ${username}:`, failed.map((f) => f.email));
        }

        return NextResponse.json({
            success: true,
            u2faRequired: true,
            maskedEmail: maskEmail(emails[0]),
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Authentication error" }, { status: 500 });
    }
}
