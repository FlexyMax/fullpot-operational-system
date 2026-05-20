require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');
const config = { user: process.env.DB_USER, password: process.env.DB_PASSWORD, server: process.env.DB_HOST||'', port: parseInt(process.env.DB_PORT||'1433'), database: process.env.DB_NAME, options: { encrypt: true, trustServerCertificate: process.env.DB_TRUST_CERT==='true', enableArithAbort: true, connectTimeout: 15000 }};
async function main() {
    const pool = await sql.connect(config);
    // Get SP definition
    const r1 = await pool.request().query(`SELECT OBJECT_DEFINITION(OBJECT_ID('sp_flower_products_alternative_not_in')) AS def`);
    console.log('=== sp_flower_products_alternative_not_in ===\n' + r1.recordset[0].def);
    // Test with a real product unico
    const r2 = await pool.request().query(`SELECT TOP 1 unico FROM flower_products WHERE active=1`);
    const realUnico = r2.recordset[0]?.unico;
    console.log('\nReal unico for test:', realUnico);
    if (realUnico) {
        const r3 = await pool.request().input('lcproduct_uq', sql.VarChar(8), realUnico).input('lcdescription', sql.VarChar(20), '%').execute('sp_flower_products_alternative_not_in');
        console.log('Rows with real product + search=%:', r3.recordset.length);
    }
    await pool.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
