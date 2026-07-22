import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const r = await executeProcedure("sp_flower_banks_list", {});
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { bank, address, phone_1, contact } = await req.json();
        if (!bank?.trim()) return NextResponse.json({ success: false, error: "Bank name is required" }, { status: 400 });
        const result = await executeProcedure("sp_NC_flower_banks_insert", {
            bank: bank.trim(), address: address?.trim() ?? "", phone_1: phone_1?.trim() ?? "", contact: contact?.trim() ?? "",
        });
        const row = result.recordset?.[0];
        if (row?.Error) return NextResponse.json({ success: false, error: row.Message }, { status: 400 });
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.Message });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
