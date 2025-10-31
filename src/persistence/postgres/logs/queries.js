const track_processed_file = values => ({
    name: 'track-processed-file',
    text: `INSERT INTO imported_files (filename) 
    VALUES ($1) `,
    values
});

const get_processed_files = values => ({
    name: 'get-processed-files',
    text: `SELECT imported_files.filename 
    FROM imported_files `,
    values
});

const get_logs_from_start = values => ({
    name: 'get-logs-from-start',
    text: `SELECT logs.id, logs.ip, logs.method, logs.route, logs.status, logs.bytes, logs.timestamp, logs.referrer, logs.user_agent, logs.raw_line 
    FROM logs 
    ORDER BY logs.ip DESC, logs.route DESC, logs.id DESC
    LIMIT $1 + 1 `,
    values
});

const get_logs_from_token = values => ({
    name: 'get-logs-from-token',
    text: `SELECT logs.id, logs.ip, logs.method, logs.route, logs.status, logs.bytes, logs.timestamp, logs.referrer, logs.user_agent, logs.raw_line 
    FROM logs 
    WHERE logs.ip < $1 OR (logs.ip = $1 AND logs.route < $2) OR (logs.ip = $1 AND logs.route = $2 AND logs.id < $3) 
    ORDER BY logs.ip DESC, logs.route DESC, logs.id DESC 
    LIMIT $4 + 1`,
    values
});

module.exports = {
    track_processed_file,
    get_processed_files,
    get_logs_from_start,
    get_logs_from_token
};