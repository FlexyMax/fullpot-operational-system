require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');
const config = { user: process.env.DB_USER, password: process.env.DB_PASSWORD, server: process.env.DB_HOST||'', port: parseInt(process.env.DB_PORT||'1433'), database: process.env.DB_NAME, options: { encrypt: true, trustServerCertificate: process.env.DB_TRUST_CERT==='true', enableArithAbort: true, connectTimeout: 15000 }};
async function main() {
    const pool = await sql.connect(config);
    const r = await pool.request().query(`
        SELECT OBJECT_DEFINITION(OBJECT_ID('sp_flower_products_list_with_parameters')) AS def
    `);
    console.log(r.recordset[0].def);
    await pool.close();
}
main().catch(e=>{console.error(e.message);process.exit(1);});
