const config = require('./config.json');
const server = require('./src/server');
const logger = require('./src/logger');

const { dbhost, dbuser, dbpass, dbname, dbMaxConnections } = process.env;

if (dbhost !== undefined && dbuser !== undefined && dbpass !== undefined && dbname !== undefined) {
    // config override from environment
    config.postgres = {
        user: dbuser,
        password: dbpass,
        host: dbhost,
        database: dbname,
        maxConnections: dbMaxConnections || 20
    }
}

server.start(config, logger);
