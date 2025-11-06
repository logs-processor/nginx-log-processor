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
async function processFile(filePath) {
    console.log(`Processing: ${filePath} with batch size of: ${config.batch_size}`);
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
                await persistence.insertBatch(batch);
                //await persistence.insertBatchCopy(batch);
                inserted += batch.length;
            } catch (err) {
                hasError = true;
                failedBatches++;
                console.error(`Error inserting batch (${batch.length} items):`, err.message);
            } finally {
                batch = [];
            }
        }
    }

    // Insert any remaining records
    if (batch.length > 0) {
        try {
            await persistence.insertBatch(batch);
            inserted += batch.length;
        } catch (err) {
            hasError = true;
            failedBatches++;
            console.error(`Error inserting last batch (${batch.length} items):`, err.message);
        }
    }

    const endTime = Date.now();
    const durationSec = ((endTime - startTime) / 1000).toFixed(2);

    if (hasError) {
        console.log(`Finished with errors: ${filePath}`);
        console.log(`Inserted: ${inserted.toLocaleString()} logs`);
        console.log(`Failed batches: ${failedBatches}`);
        console.log(`Time: ${durationSec}s\n`);
    } else {
        console.log(`Finished successfully: ${filePath} (${inserted.toLocaleString()} logs inserted, took ${durationSec}s)\n`);
    }
}

/**
 * Process all .log files in the configured directory.
 */
async function processAllLogs() {
    const files = (await fs.readdir(config.log_dir))
        .filter(name => name.endsWith('.log'))
        .map(name => path.join(config.log_dir, name));

    if (files.length === 0) {
        console.log('No log files found in directory.');
        return;
    }

    console.log(`Found ${files.length} log files to process.`);

    const failedFiles = [];
    // Fetch already processed files from the database
    let processedFiles = [];
    try {
        processedFiles = await persistence.getProcessedFiles();
    } catch (err) {
        console.error(`Failed to fetch processed files, Err: ${err.message}`);
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
        console.log('All files have already been processed.');
        return;
    }

    console.log(`Processing ${filesToProcess.length} new log files.`);
    await persistence.dropIndexes();

    for (const file of filesToProcess) {
        try {
            await processFile(file);
            await persistence.trackProcessedFile([file]);
        } catch (err) {
            console.error(`Failed to process ${file}:`, err.message);
            failedFiles.push(file);
        }
    }
    await persistence.createIndexes();
    if (failedFiles.length > 0) {
        console.log('Some files failed:');
        failedFiles.forEach(f => console.log(` - ${f}`));
    } else {
        console.log('All files processed successfully.');
    }
}

module.exports = (db, cfg) => {
    persistence = db;
    config = cfg;
    return {
        processAllLogs
    };
};