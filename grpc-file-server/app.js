const loggerFactory = require('./logging')
const config = require('config')
const grpc = require('grpc')
const fileServerServiceFactory = require('./services/fileServerService')
const filesServerRepoFactory = require('./repos/filesServerRepo')

const logger = loggerFactory.create('startup')
logger.info('File Server Service Starting')

process.on('unhandledRejection', error => {
    loggerFactory.create('global-rejection')
        .error('Unhandled Promise Rejection =>', error)
})

process.on('uncaughtException', error => {
    loggerFactory.create('global-exception')
        .error('Unhandled Error =>', error)
})

const server = new grpc.Server()
const { bindAddress } = config.hosting

filesServerRepoFactory.create()
    .then((fileServerRepo) => fileServerServiceFactory.create({ fileServerRepo }))
    .then((fileServerService) => {
        server.addService(fileServerService.service, fileServerService.implementation)
        server.bind(bindAddress, grpc.ServerCredentials.createInsecure())
        server.start()

        logger.info('File Server Service Running @ [%s]', bindAddress)
    })
