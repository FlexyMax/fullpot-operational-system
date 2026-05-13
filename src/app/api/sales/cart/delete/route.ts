import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const line_uq = searchParams.get("lineUq");

        if (!line_uq) {
            return NextResponse.json({ success: false, message: "Line ID is required" }, { status: 400 });
        }

        // sp_flower_invoice_box_delete
        const result = await executeProcedure("sp_flower_invoice_box_delete", {
            invoice_box_uq: line_uq,
            user_uq: (session.user as any).id,
        });

        return NextResponse.json({ success: true, result: result.recordset });
    } catch (error: any) {
        console.error("Delete Cart Item error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
