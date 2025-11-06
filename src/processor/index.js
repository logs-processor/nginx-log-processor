const logger = require('../logger');
const fs = require('fs/promises');
const fstream = require('fs');
const readline = require('readline');
const path = require('path');
const { parseLogLine } = require('../parser');
let persistence;
let config;

/**
 * Process a single log file line by line and insert logs in batches.
 */
const processFile = async(filePath) => {
    logger.debug(`Processing: ${filePath} with batch size of: ${config.batch_size}`)
    const startTime = Date.now();

    const stream = fstream.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let batch = [];
    let inserted = 0;
    let failedBatches = 0;
    let hasError = false;

    for await (const line of rl) {
        const parsed = parseLogLine(line);
        if (!parsed) continue;

        batch.push(parsed);

        if (batch.length >= config.batch_size) {
            try {
                await persistence.insertBatch(batch, filePath);
                inserted += batch.length;
            } catch (err) {
                hasError = true;
                failedBatches++;
                logger.error(`Error inserting batch (${batch.length} items), Err ${err.message}`, );
            } finally {
                batch = [];
            }
        }
    }

    // Insert any remaining records
    if (batch.length > 0) {
        try {
            await persistence.insertBatch(batch, filePath);
            inserted += batch.length;
        } catch (err) {
            hasError = true;
            failedBatches++;
            logger.error(`Error inserting last batch (${batch.length} items), Err: ${err.message}`);

        }
    }

    const endTime = Date.now();
    const durationSec = ((endTime - startTime) / 1000).toFixed(2);

    if (hasError) {
        logger.error(`Finished with errors: ${filePath}`);
        logger.error(`Inserted: ${inserted.toLocaleString()} logs`);
        logger.error(`Failed batches: ${failedBatches}`);
        logger.error(`Time: ${durationSec}s`);
    } else {
        logger.info(`Finished successfully: ${filePath} (${inserted.toLocaleString()} logs inserted, took ${durationSec}s)`);
    }
};

/**
 * Process all .log files in the configured directory.
 */
const processAllLogs = async() => {
    const files = (await fs.readdir(config.log_dir))
        .filter(name => name.endsWith('.log'))
        .map(name => path.join(config.log_dir, name));

    if (files.length === 0) {
        logger.info(`No log files found in directory.`);
        return;
    }

    logger.info(`Found ${files.length} log files to process.`);

    const failedFiles = [];
    // Fetch already processed files from the database
    let processedFiles = [];
    try {
        processedFiles = await persistence.getProcessedFiles();
    } catch (err) {
        logger.error(`Failed to fetch processed files, Err: ${err.message}`);
        processedFiles = [];
    }

    if(processedFiles.rowCount > 0){
        processedFiles = processedFiles.rows.map(r => r.filename);
    } else {
        processedFiles = [];
    }

    // Filter out already processed files
    const filesToProcess = files.filter(f => !processedFiles.includes(f) && !processedFiles.includes(f));
    
    if (filesToProcess.length === 0) {
        logger.info(`All files have already been processed.`);
        return;
    }

    logger.info(`Processing ${filesToProcess.length} new log files.`);
    await persistence.dropIndexes();

    for (const file of filesToProcess) {
        try {
            await processFile(file);
            await persistence.trackProcessedFile([file]);
        } catch (err) {
            logger.error(`Failed to process ${file}: ${err.message}`);
            failedFiles.push(file);
        }
    }
    await persistence.createIndexes();
    if (failedFiles.length > 0) {
        logger.error(`Failed files: ${err.message}`);
        failedFiles.forEach(f => logger.error((` - ${f}`)));
    } else {
        logger.info(`All files processed successfully.`);
    }
};

module.exports = (db, cfg) => {
    persistence = db;
    config = cfg;
    return {
        processAllLogs
    };
};