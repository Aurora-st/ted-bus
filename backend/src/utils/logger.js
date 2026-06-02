import winston from 'winston';

const { combine, timestamp, errors, json } = winston.format;

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: 'bus-backend' },
  transports: [
    new winston.transports.Console()
  ]
});

