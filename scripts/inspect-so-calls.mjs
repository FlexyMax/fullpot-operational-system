import sql from "mssql";

const config = {
    user: "azure", password: "FullPot1516sql$$$",
    server: "flexymaxfpsql.public.9a4b26c7b85f.database.windows.net",
    port: 3342, database: "fullpot",
    options: { encrypt: true, trustServerCertificate: true, enableArithAbort: true },
};

async function callSP(pool, name, params) {
    const req = pool.request();
    for (const [k, v] of Object.entries(params)) req.input(k, v);
    const r = await req.execute(name);
    const sets = r.recordsets ?? [r.recordset];
    console.log(`\n=== ${name} (${sets.length} recordset(s)) ===`);
    sets.forEach((rs, i) => {
        console.log(`  Recordset[${i}]: ${rs.length} rows`);
        if (rs.length > 0) {
            console.log("  Columns:", Object.keys(rs[0]).join(", "));
            console.log("  Row[0]:", JSON.stringify(rs[0]).substring(0, 600));
        }
    });
    return sets;
}

try {
    const pool = await sql.connect(config);

    // 1. Get a list of SOs to get a real unico
    const listSets = await callSP(pool, "sp_flower_standing_orders_header_by_customer", { lccustomer_uq: "%" });
    const firstRow = listSets[0]?.[0];
    if (!firstRow) { console.log("No orders found"); process.exit(1); }
    const soUnico = Object.entries(firstRow).find(([k]) => k.toLowerCase().includes("unico"))?.[1]
                 ?? Object.entries(firstRow).find(([k]) => k.toLowerCase() === "so_uq")?.[1]
                 ?? Object.values(firstRow)[0];
    console.log("\n>>> Using SO unico:", soUnico);
    console.log(">>> First row keys:", Object.keys(firstRow).join(", "));

    // 2. Call header SP
    await callSP(pool, "sp_flower_standing_order_uq", { lcso_uq: soUnico });

    // 3. Call lines SP
    const linesSets = await callSP(pool, "sp_flower_sales_orders_details", { lcsorder_uq: soUnico });

    // 4. If there are lines, call detail_growers on the first line
    const firstLine = linesSets[0]?.[0];
    if (firstLine) {
        const lineUnico = Object.entries(firstLine).find(([k]) => k.toLowerCase().includes("unico"))?.[1];
        console.log("\n>>> First line unico:", lineUnico);
        if (lineUnico) {
            await callSP(pool, "sp_flower_standing_orders_detail_growers", { lcsorderd_uq: lineUnico });
        }
    }

    await pool.close();
} catch (e) { console.error("Error:", e.message); }
