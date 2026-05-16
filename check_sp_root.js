const sql = require('mssql');

const config = {
    user: 'azure',
    password: 'FullPot1516sql$$$',
    server: 'flexymaxfpsql.public.9a4b26c7b85f.database.windows.net',
    port: 3342,
    database: 'fullpot',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    }
};

async function checkSP() {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('objname', sql.VarChar, 'sp_flower_NC_stock_salesman_warehouse_with_customer')
            .execute('sp_help');

        console.log('--- PARAMETERS ---');
        const params = result.recordsets[1];
        params.forEach(p => {
            console.log(`${p.Parameter_name} (${p.Type})`);
        });
        console.log('--- END ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSP();
