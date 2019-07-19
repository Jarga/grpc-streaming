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
    if (await !fs.exists(filePath)) {
        throw new Error(`File ${filePath} does not exist!`)
    }

    const call = client.upload((err) => {
        if (err) throw (err)
    })

    const readStream = fs.createReadStream(filePath)
    const filename = path.basename(filePath)

    // Initialize the write with the filename
    call.write({ filename, chunk: null })

    // Stream all file data to the client
    await pipelineAsync(
        readStream,
        createBytesToMessageTransformStream(filename),
        call,
    )
}

module.exports.download = async (filename) => {
    const writeStream = fs.createWriteStream(filename)
    return await download(filename, writeStream)
}

module.exports.cat = async (filename) => {
    const writeStream = createBytesToStdOutTransformStream()
    return await download(filename, writeStream)
}

module.exports.formatFileSystem = () => new Promise((res, rej) => {
    client.formatFileSystem({}, (err) => {
        if (err) rej(err)
        else res()
    })
})

module.exports.listFiles = (filter = '{}') => new Promise((res, rej) => {
    client.listFiles({ filter }, (err, { files }) => {
        if (err) rej(err)
        else res(files)
    })
})

const download = async (filename, writeStream) => {
    const call = client.download({ filename })

    await pipelineAsync(
        call,
        createMessageToBytesTransformStream(),
        writeStream,
    )
}

const createMessageToBytesTransformStream = () => new Transform({
    objectMode: true,
    transform: (message, _, done) => {
        done(null, message.chunk)
    },
})

const createBytesToStdOutTransformStream = () => new Transform({
    objectMode: true,
    transform: (bytes, _, done) => {
        console.log(bytes.toString())
        done(null)
    },
})

const createBytesToMessageTransformStream = (filename) => new Transform({
    objectMode: true,
    transform: (bytes, _, done) => {
        done(null, { filename, chunk: bytes })
    },
})