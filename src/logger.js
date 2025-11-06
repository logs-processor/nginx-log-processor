const {createLogger, transports, format} = require('winston');
const {combine, timestamp, printf} = format;
let config = require('../config.json');

if (typeof config === 'undefined') {
    config = {level: 'error'};
}
else {
    config = config.logger;
}

let customTransports = [];
let file = config.log_file_path;

switch (config.output_mode) {
    // In console mode, there should be no trasnport to file, only stdout
    case 'console':
        customTransports = [
            new transports.Console()
        ];
        break;
    // In file mode log is transported to file only
    case 'file':
        customTransports = [
            new transports.File({
                filename: file,
            })
        ];
        break;
    // In file and console mode log is transported to both: file and console
    case 'file_and_console':
        customTransports = [
            new transports.Console(),
            new transports.File({
                filename: file,
            })
        ];
        break;
    default:
        customTransports = [
            new winston.transports.Console()
        ];
        break;

}

const logFormat = printf(({level, message, timestamp}) => {
    return `${timestamp}[${level}]: ${message}`;
});

const logger = createLogger({
    level: config.level,
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: customTransports
});

module.exports = logger;