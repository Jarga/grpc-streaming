const domain = require('../domain')
const grpc = require('grpc')
const options = grpc.credentials.createInsecure()
const fs = require('fs')
const { Transform, pipeline } = require('stream')
const path = require('path')
const client = new domain.FileServer('localhost:50051', options)
const util = require('util')
const pipelineAsync = util.promisify(pipeline)

module.exports.uploadFromFileStream = (filename, readStream) => new Promise((res, rej) => {
    if (!filename) throw new Error('filename is required!')
    if (!readStream) throw new Error('readSream is required!')

    const call = client.upload((err, result) => {
        if (err) rej(err)
        res(result.file)
    })

    // Initialize the write with the filename
    call.write({ filename, chunk: null })

    // Stream all file data to the client
    pipeline(
        readStream,
        createBytesToMessageTransformStream(filename),
        call,
        (err) => {
            if (err) rej(err)
        }
    )
})

module.exports.uploadFile = async (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File ${filePath} does not exist!`)
    }

    const stream = fs.createReadStream(filePath)
    const filename = path.basename(filePath)
    return await module.exports.uploadFromFileStream(filename, stream)
}

module.exports.downloadToFileStream = async (filename, writeStream) => {
    if (!filename) throw new Error('filename is required!')
    if (!writeStream) throw new Error('writeStream is required!')

    const call = client.download({ filename })

    await pipelineAsync(
        call,
        createMessageToBytesTransformStream(),
        writeStream,
    )
}

module.exports.downloadFile = async (filename, saveToPath) => {
    if (!filename) throw new Error('filename is required!')
    if (!saveToPath) throw new Error('saveToPath is required!')

    const writeStream = fs.createWriteStream(saveToPath || filename)
    return await module.exports.downloadToFileStream(filename, writeStream)
}

module.exports.removeFile = (filename) => new Promise((res, rej) => {
    client.removeFile({ filename }, (err) => {
        if (err) rej(err)
        else res()
    })
})


module.exports.formatFileSystem = () => new Promise((res, rej) => {
    client.formatFileSystem({}, (err) => {
        if (err) rej(err)
        else res()
    })
})

module.exports.listFiles = (filter) => new Promise((res, rej) => {
    client.listFiles({ filter: filter || '{}' }, (err, results) => {
        if (err) rej(err)
        else res(results.files)
    })
})

module.exports.getFileInfo = (filename) => new Promise((res, rej) => {
    client.getFileInfo({ filename }, (err, results) => {
        if (err) rej(err)
        else res(results.file)
    })
})

module.exports.printFileContent = async (filename) => {
    if (!filename) throw new Error('filename is required!')

    const writeStream = createBytesToStdOutTransformStream()
    return await module.exports.downloadToFileStream(filename, writeStream)
}

module.exports.printFiles = async (filter) => {
    const files = await module.exports.listFiles(filter)
    const padding = files.reduce((a, c) => Object.keys(c).reduce((ka, kc) => {
        const existing = a[kc] === undefined ? 0 : a[kc]
        const current = c[kc] === undefined ? 0 : ('' + c[kc]).length
        return { ...ka, [kc]: existing > current ? existing : current }
    }, {}), {})

    const p1 = padding['length']
    const output = files
        .map(f => `${f.length.padEnd(p1)} ${new Date(f.uploadDate).toISOString()} ${f.filename}`)
        .join('\n')

    console.log(output)
}


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

const createBytesToStdOutTransformStream = () => new Transform({
    objectMode: true,
    transform: (bytes, _, done) => {
        console.log(bytes.toString())
        done(null)
    },
})