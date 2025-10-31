let persistence;
const errors = require('../../constants/error-codes');
const {
    success,
    badRequest,
    internalError,
} = require('../../responses');

const getLogsPaginated = async (req, res) => {
    const {batchSize, paginationToken} = req.query;
    console.log(`[Logs] Received request to get logs paginaged`);
    if (!batchSize) {
        console.log(`[Logs] Bad request. Missing batchSize param.`);
        return badRequest(res, errors.get_logs_paginated.bad_request, 'Bad request. Missing batchSize parameters.');
    }
    let logs;
    let cursorHash;
    if (paginationToken) {
        let cursor = Buffer.from(paginationToken, 'base64').toString().split(',');
        if (cursor.length < 3) {
            return internalError(res, errors.get_logs_paginated.wrong_cursor_format, 'Invalid page cursor hash.');
        }
        let id = cursor[0];
        let ip = cursor[1];
        let route = cursor[2];
        try {
            console.log(`[Logs] Calling storage to get next: ${batchSize} logs starting from cursor:${paginationToken}`);
            logs = await persistence.getLogsFromToken([ip, route, id, batchSize]);
        } catch (err) {
            console.log(`[Logs] Persistence failed to get logs batch of size:${batchSize} starting from:${paginationToken}, Err ${err.message}`);
            return internalError(res, errors.get_logs_paginated.persistence_error, 'Persistence failed to get next logs batch.');
        }
        if (logs.rowCount > 0) {
            if (logs.rows[batchSize - 1] && logs.rowCount > batchSize) {
                cursorHash = __makePaginationToken(logs, batchSize);
                logs.rows.pop();
            }
            return success(res, {
                objects: logs.rows,
                metadata: {
                    "paginationToken": cursorHash,
                    "batchSize": logs.rows.length
                }
            });
        } else {
            return internalError(res, errors.get_logs_paginated.internal_server_error, 'Failed to get logs batch from cursor.');
        }
    } else {
        try {
            console.log(`[Logs] Calling storage to get first logs batch of size: ${batchSize}`);
            logs = await persistence.getLogsFromStart([batchSize]);
        } catch (err) {
            console.log(`[Logs] Persistence failed to get ${batchSize} logs, Err: ${err.message}`);
            return internalError(res, errors.get_logs_paginated.persistence_error, `Persistence failed to retrieve first logs batch.`);
        }
        if (logs.rowCount > 0) {
            if (logs.rows[batchSize - 1] && logs.rowCount > batchSize) {
                cursorHash = __makePaginationToken(logs, batchSize);
                logs.rows.pop();
            }
            success(res, {
                objects: logs.rows,
                metadata: {
                    "paginationToken": cursorHash,
                    "batchSize": logs.rows.length
                }
            });
        } else {
            return success(res, {objects: [], metadata: {batchSize: 0}});
        }
    }
};

const __makePaginationToken = (logs, batchSize) => {
    let id = logs.rows[batchSize - 1].id;
    let ip = logs.rows[batchSize - 1].ip;
    let route = logs.rows[batchSize - 1].route;
    return Buffer.from(id + ',' + ip + ',' + route).toString('base64');
};

module.exports = (db) => {
    persistence = db;
    return {
        getLogsPaginated
    }
};