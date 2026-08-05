import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "1E2123EC";
const txt   = (v: any) => String(v ?? "").trim();
const num   = (v: any) => parseFloat(v ?? 0) || 0;
const bit   = (v: any) => Boolean(v);

export async function GET() {
    const r = await executeProcedure("sp_flower_invoice_automatic_charges_template", {});
    return NextResponse.json(r.recordset ?? []);
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const b = await req.json();
        const r = await executeProcedure("sp_flower_invoice_automatic_charges_template_insert", {
            lcproduct_uq:  txt(b.product_uq),
            ldstart:       b.start_date,
            ldend:         b.end_date,
            lnunit_price:  num(b.unit_price),
            llfbox:        bit(b.fbox),
            lnporcentage:  num(b.porcentage),
            llactive:      bit(b.active),
        });
        const row = r.recordset?.[0];
        serverAuditLog(PANTA, "Insert", "flower_invoice_automatic_charges_template", txt(row?.unico)).catch(() => {});
        return NextResponse.json({ success: true, unico: row?.unico, message: row?.message });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
