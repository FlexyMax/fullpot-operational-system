require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');
const config = { user: process.env.DB_USER, password: process.env.DB_PASSWORD, server: process.env.DB_HOST||'', port: parseInt(process.env.DB_PORT||'1433'), database: process.env.DB_NAME, options: { encrypt: true, trustServerCertificate: process.env.DB_TRUST_CERT==='true', enableArithAbort: true, connectTimeout: 15000 }};
async function main() {
    const pool = await sql.connect(config);
    // Get full SP definition for update
    const r1 = await pool.request().query(`SELECT OBJECT_DEFINITION(OBJECT_ID('sp_flower_products_update_from_varieties')) AS def`);
    console.log('=== sp_flower_products_update_from_varieties ===');
    console.log(r1.recordset[0].def);
    // Get flower_products table columns
    const r2 = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='flower_products' ORDER BY ORDINAL_POSITION`);
    console.log('\n=== flower_products columns ===');
    console.log(r2.recordset.map(x=>`${x.COLUMN_NAME}(${x.DATA_TYPE})`).join(', '));
    await pool.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
