const domain = require('../domain')
const grpc = require('grpc')
const options = grpc.credentials.createInsecure()
const fs = require('fs')
const client = new domain.Files('localhost:50051', options)

module.exports.write = (fileName) => new Promise((res, rej) => {
    const call = client.write((err) => {
        rej(err)
    })

    return fs.createReadStream(fileName)
        .on('error', (err) => {
            rej(err)
        })
        .on('data', (chunk) => {
            call.write({ fileName, chunk })
        })
        .on('end', () => {
            res()
        })

})

module.exports.read = (fileName) => new Promise((res, rej) => {
    const call = client.read(fileName)

    call.on('data', (chunk) => {
        console.log(chunk)
    })

    call.on('end', () => {
        res()
    })
})