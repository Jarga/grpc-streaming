const domain = require('../domain')
const grpc = require('grpc')
const options = grpc.credentials.createInsecure()
const fs = require('fs')
const { Transform, pipeline } = require('stream')
const path = require('path')
const client = new domain.FileServer('localhost:50051', options)
const util = require('util')
const pipelineAsync = util.promisify(pipeline)

module.exports.upload = async (filePath) => {
    const call = client.upload((err) => {
        throw err
    })

    const readStream = fs.createReadStream(filePath)
    const filename = path.basename(filePath)

    // Initialize the write with the filename
    call.write({ filename, chunk: null })

    // Stream all file data to the client
    return await pipelineAsync(
        readStream,
        createBytesToMessageTransformStream(filename),
        call
    )
}

module.exports.download = async (filename) => {
    const call = client.download({ filename }, (err) => {
        throw err
    })

    const writeStream = fs.createWriteStream(filename)

    return await pipelineAsync(
        call,
        createMessageToBytesTransformStream(),
        writeStream
    )
}

module.exports.formatFileSystem = () => new Promise((res, rej) => {
    client.formatFileSystem({}, (err) => {
        if (err) rej(err)
        else res()
    })
})

const createMessageToBytesTransformStream = () => new Transform({
    objectMode: true,
    transform: (message, _, done) => {
        done(null, message.chunk)
    },
})

const createBytesToMessageTransformStream = (filename) => new Transform({
    objectMode: true,
    transform: (bytes, _, done) => {
        done(null, { filename, chunk: bytes })
    },
})