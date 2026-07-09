import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ success: false, message: "Missing userId" }, { status: 400 });
        }

        const result = await executeProcedure("sp_NC_user_access_detail", {
            lcCompany_uq: process.env.COMPANY_ID || 'R7X98780',
            lcgcuser_uq: userId,
        }, true);

        // Filter for APP and SISTEMA modules, AND only items the user has access to.
        // sp_NC_user_access_detail returns all company screens; acceso/access flag indicates
        // whether this specific user has been granted access to that screen.
        const filteredMenu = result.recordset.filter((item: any) => {
            const mClass = String(item.module_class || '').trim().toUpperCase();
            if (mClass !== 'APP' && mClass !== 'SISTEMA') return false;
            // Check whichever field name the SP uses (acceso = Spanish, access = possible alias)
            const hasAccess = item.acceso === true || item.acceso === 1 ||
                              item.access  === true || item.access  === 1;
            return hasAccess;
        });

        return NextResponse.json({ success: true, menu: filteredMenu });
    } catch (error: any) {
        console.error("Menu API error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
