require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');
const config = { user: process.env.DB_USER, password: process.env.DB_PASSWORD, server: process.env.DB_HOST||'', port: parseInt(process.env.DB_PORT||'1433'), database: process.env.DB_SISTEMA_NAME, options: { encrypt: true, trustServerCertificate: process.env.DB_TRUST_CERT==='true', enableArithAbort: true, connectTimeout: 15000 }};

async function main() {
    const pool = await sql.connect(config);
    const term = process.argv[2] || 'BUSINESS INTELLIGENCE';
    const r = await pool.request().input('term', sql.VarChar, `%${term}%`).query(`
        SELECT p.unico, p.nombre, p.modulo_uq, m.nombre AS modulo_nombre, p.menu, p.path, p.web_form
        FROM pantalla p
        LEFT JOIN modulo m ON m.unico = p.modulo_uq
        WHERE p.nombre LIKE @term
    `);
    console.table(r.recordset);
    await pool.close();
}
main().catch(e => { console.error(e.message); process.exit(1); });
