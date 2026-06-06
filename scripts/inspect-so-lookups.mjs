import sql from "mssql";
const config = {
    user: "azure", password: "FullPot1516sql$$$",
    server: "flexymaxfpsql.public.9a4b26c7b85f.database.windows.net",
    port: 3342, database: "fullpot",
    options: { encrypt: true, trustServerCertificate: true, enableArithAbort: true },
};

async function call(pool, name, params = {}) {
    const req = pool.request();
    for (const [k, v] of Object.entries(params)) req.input(k, v);
    const r = await req.execute(name);
    const rows = r.recordset ?? [];
    console.log(`\n=== ${name} → ${rows.length} rows ===`);
    if (rows[0]) console.log("  cols:", Object.keys(rows[0]).join(", "));
    if (rows[0]) console.log("  row0:", JSON.stringify(rows[0]).slice(0, 300));
    return rows;
}

try {
    const pool = await sql.connect(config);

    // Find product/box search SPs
    const found = await pool.request().query(`
        SELECT r.ROUTINE_NAME, p.PARAMETER_NAME, p.DATA_TYPE, p.ORDINAL_POSITION
        FROM INFORMATION_SCHEMA.ROUTINES r
        LEFT JOIN INFORMATION_SCHEMA.PARAMETERS p ON r.ROUTINE_NAME = p.SPECIFIC_NAME
        WHERE r.ROUTINE_NAME LIKE '%box%list%' OR r.ROUTINE_NAME LIKE '%product%list%'
           OR r.ROUTINE_NAME LIKE '%cases%list%' OR r.ROUTINE_NAME LIKE '%case%list%'
           OR r.ROUTINE_NAME LIKE '%cargo%' OR r.ROUTINE_NAME LIKE '%agency%'
           OR r.ROUTINE_NAME LIKE '%shipto%' OR r.ROUTINE_NAME LIKE '%ship_to%'
           OR r.ROUTINE_NAME LIKE '%carrier%list%' OR r.ROUTINE_NAME LIKE '%terms%list%'
        ORDER BY r.ROUTINE_NAME, p.ORDINAL_POSITION
    `);
    let cur = "";
    for (const row of found.recordset) {
        if (row.ROUTINE_NAME !== cur) { cur = row.ROUTINE_NAME; console.log(`\n--- ${cur} ---`); }
        if (row.PARAMETER_NAME) console.log(`  [${row.ORDINAL_POSITION}] ${row.PARAMETER_NAME}  ${row.DATA_TYPE}`);
    }

    // Try calling the likely ones
    try { await call(pool, "sp_flower_boxes_list", { lcdescription: "%ROSE%", lcshortcode: "%", lcoldcode: "%" }); } catch(e) { console.log("sp_flower_boxes_list error:", e.message); }
    try { await call(pool, "sp_flower_cases_list", {}); } catch(e) { console.log("sp_flower_cases_list error:", e.message); }
    try { await call(pool, "sp_flower_cargo_agencies_list", {}); } catch(e) { console.log("sp_flower_cargo_agencies_list error:", e.message); }
    try { await call(pool, "sp_flower_customers_list_to_prebooks", { lcsalesman_uq: "%" }); } catch(e) {}

    // Also check what sp_flower_customer_carriers returns (for shipto/carrier)
    try {
        // Get a real customer uq first
        const cust = await pool.request().query("SELECT TOP 1 unico FROM flower_customers WHERE active=1");
        const custUq = cust.recordset[0]?.unico ?? "%";
        await call(pool, "sp_flower_customer_carriers", { customer_uq: custUq, shipto_uq: "%" });
        await call(pool, "sp_flower_customer_shiptos", { lccustomer_uq: custUq });
    } catch(e) { console.log("carrier/shipto error:", e.message); }

    await pool.close();
} catch(e) { console.error(e.message); }
