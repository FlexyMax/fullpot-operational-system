import sql from 'mssql';

const baseConfig: sql.config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST || '',
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: true,
        trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
        enableArithAbort: true,
        connectTimeout: 30000,
    },
    // Bumped from the mssql default of 15s — BI reports run heavy ad-hoc SPs over large date ranges.
    requestTimeout: 120000,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

const fullpotConfig = { ...baseConfig, database: process.env.DB_NAME };
const sistemaConfig = { ...baseConfig, database: process.env.DB_SISTEMA_NAME };

let fullpotPool: sql.ConnectionPool | null = null;
let sistemaPool: sql.ConnectionPool | null = null;

export const getFullpotPool = async () => {
    try {
        if (fullpotPool?.connected) return fullpotPool;
        console.log(`📡 [DB DEBUG]: Attempting connect to ${baseConfig.server}:${baseConfig.port} DB:${process.env.DB_NAME}`);
        fullpotPool = await new sql.ConnectionPool(fullpotConfig).connect();
        console.log(`✅ [DB DEBUG]: FULLPOT Connected`);
        return fullpotPool;
    } catch (err: any) {
        console.error(`❌ [DB DEBUG]: FULLPOT Connection Error:`, err.message);
        throw err;
    }
};

export const getSistemaPool = async () => {
    try {
        if (sistemaPool?.connected) return sistemaPool;
        console.log(`📡 [DB DEBUG]: Attempting connect to ${baseConfig.server}:${baseConfig.port} DB:${process.env.DB_SISTEMA_NAME}`);
        sistemaPool = await new sql.ConnectionPool(sistemaConfig).connect();
        console.log(`✅ [DB DEBUG]: SISTEMA Connected`);
        return sistemaPool;
    } catch (err: any) {
        console.error(`❌ [DB DEBUG]: SISTEMA Connection Error:`, err.message);
        throw err;
    }
};

export async function executeProcedure(
    procName: string,
    params: Record<string, any> = {},
    useSistema = false
) {
    try {
        const pool = useSistema ? await getSistemaPool() : await getFullpotPool();
        const request = pool.request();

        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        console.log(`🚀 [DB DEBUG]: Executing SP: ${procName} (DB: ${useSistema ? 'SISTEMA' : 'FULLPOT'})`);
        const result = await request.execute(procName);

        if (result.recordset && result.recordset[0]) {
            const firstRow = result.recordset[0] as any;
            if (firstRow.error === 1 || firstRow.error === true) {
                throw new Error(firstRow.message || 'Stored Procedure Error');
            }
        }

        return result;
    } catch (err: any) {
        console.error(`❌ [DB DEBUG]: SP Execution Error [${procName}]:`, err.message);
        throw err;
    }
}

export async function executeQuery(
    queryStr: string,
    useSistema = false
) {
    try {
        const pool = useSistema ? await getSistemaPool() : await getFullpotPool();
        console.log(`🚀 [DB DEBUG]: Executing Raw Query: ${queryStr} (DB: ${useSistema ? 'SISTEMA' : 'FULLPOT'})`);
        const result = await pool.request().query(queryStr);
        return result;
    } catch (err: any) {
        console.error(`❌ [DB DEBUG]: Query Execution Error [${queryStr}]:`, err.message);
        throw err;
    }
}

