import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const url = new URL(_req.url);
    const dateIni = url.searchParams.get("date_ini") || "";
    const dateEnd = url.searchParams.get("date_end") || "";

    try {
        const r = await executeProcedure("sp_NC_carriers_invoices_detail", {
            lccarrier_uq: unico,
            ldDate_ini: dateIni,
            ldDate_end: dateEnd
        });
        return NextResponse.json(r.recordset);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
