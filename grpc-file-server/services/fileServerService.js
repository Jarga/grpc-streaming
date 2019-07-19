const domain = require('../domain')
const filesServerRepo = require('../repos/filesServerRepo')
const logger = require('../logging').create('service')

module.exports = {
    service: domain.Files.service,
    implementation: { read, write },
}

function write(call) {
    logger.info('Recieved write request')
    call.on('data', ({ fileName, chunk }) => {
        filesServerRepo.write(fileName, chunk)
    })
}

function read(call) {
    logger.info('Recieved read request')
    // const { fileName } = call.request
    // filesServerRepo.read(fileName).pipe(call)
}