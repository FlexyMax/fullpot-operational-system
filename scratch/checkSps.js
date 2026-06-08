import sql from "mssql";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkSps() {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_HOST,
        database: process.env.DB_NAME,
        options: { 
            encrypt: true, 
            trustServerCertificate: true,
            connectTimeout: 30000
        }
    };
    try {
        await sql.connect(config);
        const sps = [
            'sp_flower_airlines_update', 
            'sp_flower_cities_update', 
            'sp_flower_seasons_update', 
            'sp_flower_warehouses_physical_update',
            'sp_flower_wphysical_update'
        ];
        for (const sp of sps) {
            const res = await sql.query(`
                SELECT PARAMETER_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
                FROM information_schema.parameters 
                WHERE specific_name = '${sp}'
                ORDER BY ORDINAL_POSITION
            `);
            console.log("SP:", sp);
            console.table(res.recordset);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await sql.close();
    }
}
checkSps();
