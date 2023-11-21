// Import the winston library
const fs = require('fs');
const winston = require("winston");
require('winston-daily-rotate-file');

// Ensure the 'logs' directory exists
fs.mkdirSync('./logs', { recursive: true });

// Create a new daily rotate file transport for the error log
const errorTransport = new winston.transports.DailyRotateFile({
    filename: './logs/error-%DATE%.log', // The filename pattern to use
    datePattern: 'YYYY-MM-DD', // The date pattern to use
    zippedArchive: true, // Whether to gzip archived log files
    maxSize: '20m', // The maximum size of a log file before it gets rotated
    maxFiles: '14d', // The maximum number of log files to keep
    level: 'error', // Only log messages with this level
});

const combinedTransport = new winston.transports.DailyRotateFile({
    filename: './logs/combined-%DATE%.log', // The filename pattern to use
    datePattern: 'YYYY-MM-DD', // The date pattern to use
    zippedArchive: true, // Whether to gzip archived log files
    maxSize: '20m', // The maximum size of a log file before it gets rotated
    maxFiles: '14d', // The maximum number of log files to keep
    level: 'info', // Only log messages with this level or above
});

// Create a new logger instance
const logger = winston.createLogger({
    // Format the logs as JSON
    format: winston.format.combine(
        winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        winston.format.printf(({ level, message, timestamp }) => {
            return `${timestamp} - ${level.charAt(0).toUpperCase() + level.slice(1)} - ${message}`;
        })
    ),
    // Define the transports for the logs
    transports: [
        // Write all logs error (and below) to `error.log`
        errorTransport, // Use the daily rotate file transport for the error log
        // Write all logs to `combined.log`
        combinedTransport, // Use the daily rotate file transport for the combined log
    ],
});

// If we're not in production then log to the `console` with the format `simple`
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
}

// Export the logger so it can be used elsewhere
module.exports = logger;

// The levels are: error (most severe), warn, info, http, verbose, debug, silly (least severe).

// Usage:
// logger.error('This is an error message');
// logger.warn('This is a warning');
// logger.info('This is an informational message');
// logger.http('This is a http log');
// logger.verbose('This is a verbose log');
// logger.debug('This is a debug log');
// logger.silly('This is a silly log');