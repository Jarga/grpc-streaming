const isProd = process.env.NODE_ENV === 'production'
const winston = require('winston')
const { consoleFormatter, isEmptyObject } = require('./utils')

let globalScope = {}

const createTransportConfig = (logLabel, scope = {}) => ({
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      level: isProd ? 'info' : 'debug',
      format: consoleFormatter(logLabel, () => ({ ...globalScope, ...scope })),
    }),
  ],
})

module.exports = {
  setGlobalScope: (scope) => {
    if (!isEmptyObject(scope)) {
      globalScope = scope
    }
  },
  clearGlobalScope: () => {
    globalScope = {}
  },
  default: winston.createLogger(createTransportConfig('file-server:default')),
  create: (name, scope = {}) => {
    const currentScope = !isEmptyObject(scope) ? scope : {}
    const transportConfig = createTransportConfig(`file-server:${name}`, currentScope)
    return winston.createLogger(transportConfig)
  },
}