import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(_req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId  = (session as any)?.user?.id ?? "";
    try {
        const [customers, salesmen, growers, warehouses] = await Promise.all([
            executeProcedure("sp_flower_customers_list_to_prebooks", { lcsalesman_uq: "%" }),
            executeProcedure("sp_flower_salesman_list",              { llall: true }),
            executeProcedure("sp_flower_growers_list",               { llall: true }),
            executeProcedure("sp_flower_salesman_warehouses",        { lcuser_uq: userId }),
        ]);
        return NextResponse.json({
            customers:  customers.recordset  ?? [],
            salesmen:   salesmen.recordset   ?? [],
            growers:    growers.recordset    ?? [],
            warehouses: warehouses.recordset ?? [],
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
