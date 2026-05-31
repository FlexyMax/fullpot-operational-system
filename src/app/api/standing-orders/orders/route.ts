import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const customer_uq = req.nextUrl.searchParams.get("customer_uq") || "%";
    const mode        = req.nextUrl.searchParams.get("mode") || "all";   // "my" | "all"
    try {
        if (mode === "search") {
            const date   = req.nextUrl.searchParams.get("date") || new Date().toISOString().slice(0, 10);
            const search = req.nextUrl.searchParams.get("q") || "";
            const r = await executeProcedure("sp_flower_standing_orders_search", {
                lddate_filter: new Date(date),
                lcsearch:      search,
            });
            return NextResponse.json(r.recordset ?? []);
        }
        // "my" mode: resolve salesman_uq first, then filter client-side
        const r = await executeProcedure("sp_flower_standing_orders_header_by_customer", {
            lccustomer_uq: customer_uq,
        });
        const rows = r.recordset ?? [];
        if (mode === "my") {
            const sal = await executeProcedure("sp_flower_salesman_uq", {
                lcunico:   "%",
                lcuser_uq: (session as any)?.user?.id ?? "",
            });
            const salUq = sal.recordset?.[0]?.unico ?? "";
            return NextResponse.json(rows.filter((x: any) =>
                (x.salesman_uq ?? x.SALESMAN_UQ ?? "") === salUq
            ));
        }
        return NextResponse.json(rows);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
