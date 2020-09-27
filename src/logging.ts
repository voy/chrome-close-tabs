import * as winston from 'winston';

export function createLogger() {
    return winston.createLogger({
        level: 'error',
        format: winston.format.json(),
        transports: [
            new winston.transports.Console(),
        ]
    })
}