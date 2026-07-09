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

        const { unico, name, email } = result.recordset[0];

        if (!email) {
            return NextResponse.json({ error: "No email address on file for this account. Contact your administrator." }, { status: 400 });
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        storeCode(username, code, unico, name || username, email);

        await sendVerificationCode(email, code, name || username);

        // Return masked email so the UI can show where the code was sent
        const [local, domain] = (email as string).split("@");
        const masked = local.slice(0, 2) + "***@" + domain;

        return NextResponse.json({ success: true, maskedEmail: masked });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Authentication error" }, { status: 500 });
    }
}
