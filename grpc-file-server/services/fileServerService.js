const domain = require('../domain')
const filesServerRepo = require('../repos/filesServerRepo')

module.exports = {
    service: domain.Files.service,
    implementation: {
        write(call) {
            const { fileName } = call.request
            filesServerRepo.write(fileName, call)
        },
        read(call) {
            const { fileName } = call.request
            filesServerRepo.read(fileName).pipe(call)
        },
    },
}