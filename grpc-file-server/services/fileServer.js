const domain = require('../domain')
const filesServerRepo = require('../repos/filesServerRepo')

module.exports = {
    service: domain.Files.service,
    implementation: {
        async write(call) {
            const { fileName } = call.request
            await filesServerRepo.write(fileName, call)
        },
        async read(call) {
            const { fileName } = call.request
            await filesServerRepo.read(fileName).pipe(call)
        },
    },
}