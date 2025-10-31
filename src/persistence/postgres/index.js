const Logs = require('./logs');
const SchemaCreator = require('./schemaCreator');

module.exports = async (config) => {
    const pgpool = await require('./client')(config);
    if (pgpool instanceof Error) {
        return pgpool;
    }

    const logs = new Logs(pgpool, config);
    const schemaCreator = new SchemaCreator(pgpool);

    return {
        logs,
        schemaCreator
    }
};