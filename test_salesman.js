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
        const [w, s] = await Promise.all([
            executeProcedure("sp_flower_warehouses_by_salesman_not_in", { lcsalesman_uq: "A91B261F" }),
            executeProcedure("sp_flower_salesmen_salesmen_not_in", { lcsalesman_uq: "A91B261F" })
        ]);
        console.log("Warehouses:", Object.keys(w.recordset[0] || {}));
        console.log(w.recordset[0]);
        console.log("Salesmen:", Object.keys(s.recordset[0] || {}));
        console.log(s.recordset[0]);
    } catch(err) {
        console.error(err.message);
    } finally {
        process.exit(0);
    }
}
run();
