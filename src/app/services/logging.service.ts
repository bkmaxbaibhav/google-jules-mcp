import winston from "winston";

// Configure winston to use stderr instead of stdout
winston.add(new winston.transports.Console({
    stderrLevels: ['info', 'error', 'warn', 'debug', 'verbose', 'silly'],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
            (info: any) => `${info.timestamp} ${info.level}: ${info.message}`
        )
    )
}));

function logger(req: any, res: any, next: any) {
    req.startTimeLog = Date.now();
    
    // Log start immediately
    winston.info(`Request Start: ${req.method} ${req.url}`);

    res.on("finish", () => {
        const timeTaken = Date.now() - req.startTimeLog;
        winston.info(`Request End: ${res.statusCode} ${req.method} ${req.url} ${timeTaken}ms ${req.ip}`);
    });
    
    next();
}           

const log = { info: winston.info };

export { log, logger };