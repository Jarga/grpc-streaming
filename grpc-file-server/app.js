const logger = require('./logging').create('startup')
const config = require('config')
const grpc = require('grpc')
const fileServer = require('./services/fileServer')

logger.info('File Server Service Starting')

process.on('unhandledRejection', error => {
    logger.error('Unhandled Promise Rejection', error)
})

process.on('uncaughtException', error => {
    logger.error('Unhandled Error', error)
})

const server = new grpc.Server()
const { bindAddress } = config.hosting
server.addService(fileServer.service, fileServer.implementation)
server.bind(bindAddress, grpc.ServerCredentials.createInsecure())
server.start()
logger.debug('File Server Service Running')