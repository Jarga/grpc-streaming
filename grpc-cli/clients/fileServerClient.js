const domain = require('../domain')
const grpc = require('grpc')
const options = grpc.credentials.createInsecure()
const fs = require('fs')
const client = new domain.FileServer('localhost:50051', options)

module.exports.write = async (fileName) => new Promise((res, rej) => {
    const call = client.write((err) => {
        rej(err)
    })

    const stream = fs.createReadStream(fileName)
    stream.on('data', (chunk) => {
        call.write({ fileName, chunk })
    })

    stream.on('end', () => {
        res()
    })

})

module.exports.read = async (fileName) => new Promise((res, rej) => {
    const call = client.read((err) => {
        rej(err)
    })

    call.on('data', (chunk) => {
        console.log(chunk)
    })

    call.on('end', () => {
        res()
    })
})