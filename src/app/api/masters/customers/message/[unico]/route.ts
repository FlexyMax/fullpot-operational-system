import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
type P = { params: Promise<{ unico: string }> };

export async function PUT(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        await executeQuery(`UPDATE flower_customers_comments SET closed=1 WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Message closed." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        await executeQuery(`DELETE FROM flower_customers_comments WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true, message: "Message deleted." });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
