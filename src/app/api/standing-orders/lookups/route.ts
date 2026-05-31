import { NextRequest, NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(_req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId  = (session as any)?.user?.id ?? "";
    try {
        const [customers, salesmen, growers, warehouses, terms, cases, cargoAgencies, myProfile] = await Promise.all([
            executeProcedure("sp_flower_customers_list_to_prebooks", { lcsalesman_uq: "%" }),
            executeProcedure("sp_flower_salesman_list",              { llall: true }),
            executeProcedure("sp_flower_growers_list",               { llall: true }),
            executeProcedure("sp_flower_salesman_warehouses",        { lcuser_uq: "%" }),
            executeProcedure("sp_flower_terms",                      {}),
            executeProcedure("sp_flower_cases_list",                 {}),
            executeProcedure("sp_flower_cargo_agencies_list",        { llall: true }),
            userId
                ? executeProcedure("sp_flower_salesman_uq", { lcunico: "%", lcuser_uq: userId })
                : Promise.resolve({ recordset: [] }),
        ]);
        return NextResponse.json({
            customers:      customers.recordset     ?? [],
            salesmen:       salesmen.recordset      ?? [],
            growers:        growers.recordset       ?? [],
            warehouses:     warehouses.recordset    ?? [],
            terms:          terms.recordset         ?? [],
            cases:          cases.recordset         ?? [],
            cargoAgencies:  cargoAgencies.recordset ?? [],
            mySalesmanUq:   (myProfile as any).recordset?.[0]?.unico ?? "",
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
