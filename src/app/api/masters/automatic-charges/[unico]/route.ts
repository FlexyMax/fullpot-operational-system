import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "C7150155";
const txt   = (v: any) => String(v ?? "").trim();
const num   = (v: any) => parseFloat(v ?? 0) || 0;
const bit   = (v: any) => Boolean(v);

export async function PUT(req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { unico } = await params;
        const b = await req.json();
        await executeProcedure("sp_flower_invoice_automatic_charges_template_update", {
            lcunico:       txt(unico),
            lcproduct_uq:  txt(b.product_uq),
            ldstart:       b.start_date,
            ldend:         b.end_date,
            lnunit_price:  num(b.unit_price),
            llfbox:        bit(b.fbox),
            lnporcentage:  num(b.porcentage),
            llactive:      bit(b.active),
        });
        serverAuditLog(PANTA, "Edit", "flower_invoice_automatic_charges_template", txt(unico)).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ unico: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { unico } = await params;
        await executeProcedure("sp_flower_invoice_automatic_charges_template_delete", {
            lcunico: txt(unico),
        });
        serverAuditLog(PANTA, "Delete", "flower_invoice_automatic_charges_template", txt(unico)).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
