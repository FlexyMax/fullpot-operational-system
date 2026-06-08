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
        const r = await executeProcedure("sp_NC_growers_list_for_growers", { lnPageNumber: 1, lnRowsOfPage: 1, lcgrower: '%' });
        console.log("Columns:", Object.keys(r.recordset[0] || {}));
    } catch(err) {
        console.error("Failed:", err.message);
    } finally {
        await sql.close();
    }
}
run();
