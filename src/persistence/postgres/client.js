const { Pool } = require('pg');
let pool;
let dbStatus = 'disconnected';

const createPool = async (config) => {
    pool = new Pool({
        host: config.host,
        user: config.user,
        password: config.pass,
        database: config.name,
        max: config.maxConnections,
        idleTimeoutMillis: config.idleTimeoutMillis || 30000,
        connectionTimeoutMillis: config.connectionTimeoutMillis || 6000,
    });

    pool.on('error', function errorFunc(err){
        console.log(`[database] error occurred, code: ${err.code}, severity: ${err.severity}`);
    });
    pool.on('connect', function connectFunc(client){
        client.on('error', function errorFunc(err){
            console.log(`[database] error occurred in connection to database: ${err.message}`);
            client.removeListener("error", errorFunc);
            dbStatus = 'disconnected';
        });
        console.log(`[database] connected to PostgreSQL server`);
        dbStatus = 'connected';
    });
    try {
        await pool.connect();
    } catch (err) {
        console.log(`Could not connect to PostgreSQL, because: ${err.message}`);
        return new Error(`Could not connect to PostgreSQL, because: ${err.message}`);
    }
};

module.exports = async (config) => {
    let err = await createPool(config);
    if (err instanceof Error) {
        return err;
    }
    const runQuery = async q => {
        return await pool.query(q);
    };
    const health = async () => {
        return {
            dbStatus: dbStatus
        }
    };
    return {
        runQuery,
        health,
        pool
    }
};