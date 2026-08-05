import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { serverAuditLog } from "@/lib/serverAudit";

const PANTA = "1E2123EC";
const txt   = (v: any) => String(v ?? "").trim();

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ unico: string; cunico: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const { cunico } = await params;
        await executeProcedure("sp_flower_invoice_automatic_charges_customers_delete", {
            lcunico: txt(cunico),
        });
        serverAuditLog(PANTA, "Delete", "flower_invoice_automatic_charges_customers", txt(cunico)).catch(() => {});
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
