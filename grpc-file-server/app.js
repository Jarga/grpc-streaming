const loggerFactory = require('./logging')
const config = require('config')
const grpc = require('grpc')
const fileServerService = require('./services/fileServerService')

const logger = loggerFactory.create('startup')
logger.info('File Server Service Starting')

process.on('unhandledRejection', error => {
    loggerFactory.create('global-rejection')
        .error('Unhandled Promise Rejection', error)
})

process.on('uncaughtException', error => {
    loggerFactory.create('global-exception')
        .error('Unhandled Error', error)
})

const server = new grpc.Server()
const { bindAddress } = config.hosting

server.addService(fileServerService.service, fileServerService.implementation)
server.bind(bindAddress, grpc.ServerCredentials.createInsecure())
server.start()

logger.debug('File Server Service Running')