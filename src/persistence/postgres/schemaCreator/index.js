const {Pool} = require('pg');

class SchemaCreator {
    constructor(pgpool, config) {
        this.runQuery = pgpool.runQuery;
    };

    createInitialDBSchema = async () => {
        return await this.runQuery(`
        BEGIN;

        CREATE TABLE IF NOT EXISTS logs (
            id BIGSERIAL,
            ip TEXT NOT NULL,
            method TEXT,
            route TEXT,
            status INT,
            bytes INT,
            timestamp TIMESTAMP,
            referrer TEXT,
            user_agent TEXT,
            raw_line TEXT,
            filename TEXT,
            PRIMARY KEY (ip, id)
        ) PARTITION BY HASH (ip);

        CREATE TABLE IF NOT EXISTS logs_p0 PARTITION OF logs FOR VALUES WITH (MODULUS 8, REMAINDER 0);
        CREATE TABLE IF NOT EXISTS logs_p1 PARTITION OF logs FOR VALUES WITH (MODULUS 8, REMAINDER 1);
        CREATE TABLE IF NOT EXISTS logs_p2 PARTITION OF logs FOR VALUES WITH (MODULUS 8, REMAINDER 2);
        CREATE TABLE IF NOT EXISTS logs_p3 PARTITION OF logs FOR VALUES WITH (MODULUS 8, REMAINDER 3);
        CREATE TABLE IF NOT EXISTS logs_p4 PARTITION OF logs FOR VALUES WITH (MODULUS 8, REMAINDER 4);
        CREATE TABLE IF NOT EXISTS logs_p5 PARTITION OF logs FOR VALUES WITH (MODULUS 8, REMAINDER 5);
        CREATE TABLE IF NOT EXISTS logs_p6 PARTITION OF logs FOR VALUES WITH (MODULUS 8, REMAINDER 6);
        CREATE TABLE IF NOT EXISTS logs_p7 PARTITION OF logs FOR VALUES WITH (MODULUS 8, REMAINDER 7);
        
        CREATE INDEX IF NOT EXISTS idx_logs_ip_route ON logs (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p0_ip_route ON logs_p0 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p1_ip_route ON logs_p1 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p2_ip_route ON logs_p2 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p3_ip_route ON logs_p3 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p4_ip_route ON logs_p4 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p5_ip_route ON logs_p5 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p6_ip_route ON logs_p6 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p7_ip_route ON logs_p7 (ip, route, timestamp);


        CREATE TABLE IF NOT EXISTS imported_files (
          id SERIAL PRIMARY KEY,
          filename TEXT UNIQUE NOT NULL,
          imported_at TIMESTAMP DEFAULT NOW()
        );

        COMMIT;
        `);
    };

}

module.exports = SchemaCreator;