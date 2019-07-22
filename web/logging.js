const winston = require('winston')
const expressWinston = require('express-winston')
const { colorize, combine, label, printf, splat, timestamp } = winston.format

const formatter = printf(
  ({ label, level, message, timestamp }) => `${level}: [${label}] ${timestamp} - ${message}`
)

const createLoggingConfig = name => ({
  format: combine(
    colorize(),
    label({ label: name }),
    splat(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    formatter
  ),
  transports: [new winston.transports.Console()],
})

const createErrLogger = name => expressWinston.errorLogger(createLoggingConfig(name))
const createLogger = name => winston.createLogger(createLoggingConfig(name))
const createReqLogger = name => expressWinston.logger(createLoggingConfig(name))

module.exports = {
  createErrLogger,
  createLogger,
  createReqLogger,
}
