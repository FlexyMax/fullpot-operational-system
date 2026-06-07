import { NextResponse } from "next/server";
import { executeProcedure } from "@/lib/db";

export async function GET() {
    try {
        const [salesmen, webSalesmen, subregions, companies, groups, terms, dcs, routes, definitions, carriers] = await Promise.all([
            executeProcedure("sp_flower_salesman_list",                    { llall: 1 }),
            executeProcedure("sp_flower_salesman_web_list",                { llall: 0 }).catch(() => ({ recordset: [] })),
            executeProcedure("sp_flower_subregions_list",                  {}),
            executeProcedure("sp_flower_related_companies",                { lctype: "SELLER" }),
            executeProcedure("sp_flower_customers_groups",                 {}),
            executeProcedure("sp_flower_terms",                            {}),
            executeProcedure("sp_flower_dc_list",                          { lcdc: "%" }),
            executeProcedure("sp_flower_customer_shipto_routes_list",      { lcroute: "%" }),
            executeProcedure("sp_flower_definitions",                      {}),
            executeProcedure("sp_flower_carriers_list",                    {}),
        ]);
        return NextResponse.json({
            salesmen:    salesmen.recordset,
            webSalesmen: webSalesmen.recordset,
            subregions:  subregions.recordset,
            companies:   companies.recordset,
            groups:      groups.recordset,
            terms:       terms.recordset,
            dcs:         dcs.recordset,
            routes:      routes.recordset,
            definitions: definitions.recordset[0] ?? {},
            carriers:    carriers.recordset,
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
