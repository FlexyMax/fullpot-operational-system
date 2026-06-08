require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    database: process.env.DB_NAME,
    options: { encrypt: true, trustServerCertificate: true }
};

async function executeProcedure(procedureName, params = {}) {
    const pool = await sql.connect(config);
    const request = pool.request();
    for (const [key, value] of Object.entries(params)) {
        request.input(key, value);
    }
    return await request.execute(procedureName);
}

async function run() {
    try {
        console.log("Starting...");
        const [salesmen, webSalesmen, subregions, companies, groups, terms, dcs, routes, definitions, carriers] = await Promise.all([
            executeProcedure("sp_flower_salesman_list",                    { llall: 1 }),
            executeProcedure("sp_NC_salesman_list",                        { llall: 1 }).catch(() => ({ recordset: [] })),
            executeProcedure("sp_flower_subregions_list",                  {}),
            executeProcedure("sp_flower_related_companies",                { lctype: "SELLER" }),
            executeProcedure("sp_flower_customers_groups",                 {}),
            executeProcedure("sp_flower_terms",                            {}),
            executeProcedure("sp_flower_dc_list",                          { lcdc: "%" }),
            executeProcedure("sp_flower_customer_shipto_routes_list",      { lcroute: "%" }),
            executeProcedure("sp_flower_definitions",                      {}),
            executeProcedure("sp_flower_carriers_list",                    {}),
        ]);
        console.log("Groups:", Object.keys(groups.recordset[0] || {}));
        console.log("Companies:", Object.keys(companies.recordset[0] || {}));
        console.log("Subregions:", Object.keys(subregions.recordset[0] || {}));
        console.log("Terms:", Object.keys(terms.recordset[0] || {}));
    } catch(err) {
        console.error("Promise.all failed:", err.message);
    } finally {
        await sql.close();
    }
}
run();
