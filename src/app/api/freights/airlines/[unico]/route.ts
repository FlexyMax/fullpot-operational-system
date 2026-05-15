import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

const txt = (v: any) => String(v ?? "").replace(/'/g, "''");
type P = { params: Promise<{ unico: string }> };

export async function PUT(req: NextRequest, { params }: P) {
    const { unico } = await params;
    const b = await req.json();
    try {
        await executeQuery(`UPDATE flower_airlines SET cod_linea='${txt(b.cod_linea)}',airline='${txt(b.airline)}',address='${txt(b.address)}',city='${txt(b.city)}',country='${txt(b.country)}',phone='${txt(b.phone)}',fax='${txt(b.fax)}',email='${txt(b.email)}',contact='${txt(b.contact)}' WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: P) {
    const { unico } = await params;
    try {
        await executeQuery(`DELETE FROM flower_airlines WHERE unico='${txt(unico)}'`);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
