const processor = require('./processor');

const start = async (config, logger) => {
    let persistence;
    try {
        persistence = await require('./persistence/postgres')(config.postgres, logger);
        if (persistence instanceof Error) {
            process.exit(1)
        }
    } catch (err) {
        logger.error(`Error occured on server start: ${err}`);
        process.exit(1)
    }

    if(config.schema_creation){
        logger.debug(`Checking DB schema...`);
        await persistence.schemaCreator.createInitialDBSchema();
    };

    const ingestor = processor(persistence.logs, config, logger);

    if (config.drain_logs_before_api_start) {
        logger.info(`Starting log ingestion...`);
        await ingestor.processAllLogs();
    }

    try {
        logger.info(`Re-creating DB indexes if not in place, this may take a while...`);
        const startTime = Date.now();
        await persistence.logs.createIndexes();
        const endTime = Date.now();
        const durationSec = ((endTime - startTime) / 1000).toFixed(2);
        logger.debug(`Indexes re-creation completed in ${durationSec} seconds`);
    } catch (err) {
        logger.error(`Error occurred on indexes re-creation, Err: ${err}`);
    }

    const app = require('./api/routes/routes')(config, persistence);
    app.listen(3000, '0.0.0.0', () => {
        logger.info(`[api] Server started on 0.0.0.0:3000`);
    });
};

module.exports = {
    start
};