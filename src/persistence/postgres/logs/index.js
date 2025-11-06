const {Pool} = require('pg');
const {
    track_processed_file,
    get_processed_files,
    get_logs_from_start,
    get_logs_from_token
} = require('./queries');

class Logs {
    constructor(pgpool, config) {
        this.cfg = config;
        this.runQuery = pgpool.runQuery;
    };

    insertBatch = async (batch, filename) => {
        if (batch.length === 0) {
            return;
        }
        const values = batch.map(entity => `(
        '${entity.ip}',
        '${entity.method}',
        '${entity.route}',
         ${entity.status || 0},
         ${entity.bytes || 0},
        '${entity.timestamp}',
        '${entity.referrer}',
        '${entity.user_agent}',
        '${entity.raw_line}',
        '${filename}'
    )`).join(',\n');
        const query = ` INSERT INTO logs  (ip, method, route, status, bytes, timestamp, referrer, user_agent, raw_line, filename)
                        VALUES ${values}; `;
        return await this.runQuery(query);
    };

    dropIndexes = async () => {
        return await this.runQuery(`
        BEGIN;
        DROP INDEX IF EXISTS idx_logs_ip_route;
        DROP INDEX IF EXISTS idx_logs_p0_ip_route;
        DROP INDEX IF EXISTS idx_logs_p1_ip_route;
        DROP INDEX IF EXISTS idx_logs_p2_ip_route;
        DROP INDEX IF EXISTS idx_logs_p3_ip_route;
        DROP INDEX IF EXISTS idx_logs_p4_ip_route;
        DROP INDEX IF EXISTS idx_logs_p5_ip_route;
        DROP INDEX IF EXISTS idx_logs_p6_ip_route;
        DROP INDEX IF EXISTS idx_logs_p7_ip_route;
        COMMIT;`)
    };

    createIndexes = async () => {
        return await this.runQuery(`
        BEGIN;
        CREATE INDEX IF NOT EXISTS idx_logs_ip_route ON logs (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p0_ip_route ON logs_p0 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p1_ip_route ON logs_p1 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p2_ip_route ON logs_p2 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p3_ip_route ON logs_p3 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p4_ip_route ON logs_p4 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p5_ip_route ON logs_p5 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p6_ip_route ON logs_p6 (ip, route, timestamp);
        CREATE INDEX IF NOT EXISTS idx_logs_p7_ip_route ON logs_p7 (ip, route, timestamp);
        COMMIT;`)
    };

    trackProcessedFile = async (data) => {
        return await this.runQuery(track_processed_file(data))
    };

    getProcessedFiles = async (data) => {
        return await this.runQuery(get_processed_files(data))
    };

    getLogsFromStart = async (data) => {
        return await this.runQuery(get_logs_from_start(data))
    };

    getLogsFromToken = async (data) => {
        return await this.runQuery(get_logs_from_token(data))
    };
}

module.exports = Logs;