import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "1E2123EC";
const txt   = (v: any) => String(v ?? "").trim();

export async function GET(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    const { unico } = await params;
    const { searchParams } = new URL(req.url);
    const type   = searchParams.get("type") ?? "not-in";   // "not-in" | "in"
    const search = "%" + (searchParams.get("q") ?? "") + "%";

    const spName = type === "in"
        ? "sp_flower_invoice_automatic_charges_customers_in"
        : "sp_flower_invoice_automatic_charges_customers_not_in";

    const r = await executeProcedure(spName, {
        lccharge_uq: txt(unico),
        lccustomer:  search,
    });
    return NextResponse.json(r.recordset ?? []);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { unico } = await params;
        const b = await req.json();

        if (b.insertAll) {
            await executeProcedure("sp_flower_invoice_automatic_charges_customers_insert_all", {
                lccharge_uq: txt(unico),
            });
            serverAuditLog(PANTA, "Insert", "flower_invoice_automatic_charges_customers", txt(unico)).catch(() => {});
            return NextResponse.json({ success: true });
        }

        const r = await executeProcedure("sp_flower_invoice_automatic_charges_customers_insert", {
            lccharge_uq:   txt(unico),
            lccustomer_uq: txt(b.customer_uq),
        });
        const row = r.recordset?.[0];
        serverAuditLog(PANTA, "Insert", "flower_invoice_automatic_charges_customers", txt(row?.unico)).catch(() => {});
        return NextResponse.json({ success: true, unico: row?.unico });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
