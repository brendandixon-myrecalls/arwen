const winston = require('winston');

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => {
        return `${info.timestamp} [${info.level}] ${info.message}`;
    })
);

const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console({ format: logFormat })
        // new winston.transports.File({ filename: '/app/log/feeder.log' })
    ]
});

// if (process.env.NODE_ENV !== 'production') {
//     logger.add(new winston.transports.Console({
//         format: logFormat
//     }));
// }

module.exports = logger;
