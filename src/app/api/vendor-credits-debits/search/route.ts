import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: NextRequest) {
    const farm    = req.nextUrl.searchParams.get("farm")    ?? "";
    const invoice = req.nextUrl.searchParams.get("invoice") ?? "";
    const po      = req.nextUrl.searchParams.get("po")      ?? "";
    try {
        const r = await executeProcedure("sp_flower_accounts_pay_cr_search", {
            lcfarm:       farm    ? `%${farm}%`    : "%",
            lcinvoice_no: invoice ? `%${invoice}%` : "%",
            lcpo_no:      po      ? `%${po}%`      : "%",
        });
        const rows = (r.recordset ?? []).map((row: any) =>
            Object.fromEntries(Object.entries(row).map(([k, v]) => [k.toLowerCase(), v]))
        );
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

