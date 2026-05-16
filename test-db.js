const sql = require('mssql');
require('dotenv').config({ path: '.env.local' });

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_SISTEMA_NAME,
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: true,
        trustServerCertificate: true,
    }
};

async function test() {
    console.log('Testing connection to:', config.server);
    console.log('Database:', config.database);
    console.log('User:', config.user);

    try {
        const pool = await sql.connect(config);
        console.log('✅ SUCCESS: Connected to SISTEMA database');
        const result = await pool.request().query('SELECT TOP 1 * FROM gcuser');
        console.log('✅ SUCCESS: Query executed, found user');
        await pool.close();
    } catch (err) {
        console.error('❌ FAILED:', err.message);
    }
}

test();
