import { NextRequest, NextResponse } from "next/server";
import { verifyAndConsumeCode, storePreAuth } from "@/lib/authCodes";

export async function POST(req: NextRequest) {
    const { username, code } = await req.json();
    if (!username || !code) {
        return NextResponse.json({ error: "Missing username or code" }, { status: 400 });
    }

    const entry = verifyAndConsumeCode(username, code);
    if (!entry) {
        return NextResponse.json({ error: "Invalid or expired verification code" }, { status: 401 });
    }

    const preAuthToken = storePreAuth(username, entry.unico, entry.name, entry.email);
    return NextResponse.json({ success: true, preAuthToken });
}
