const domain = require('../domain')
const logger = require('../logging').create('service')
const { Transform, pipeline } = require('stream')
const util = require('util')
const pipelineAsync = util.promisify(pipeline)
const { status } = require('grpc')

module.exports.create = async ({ fileServerRepo }) => ({
    service: domain.FileServer.service,
    implementation: {
        listFiles: async (call, callback) => {
            try {
                logger.debug('Recieved list files request from RPC client')
                const { filter } = call.request
                const filterObj = JSON.parse(filter)
                const files = await fileServerRepo.listFiles(filterObj)
                callback(null, { files })
            } catch (error) {
                logger.error(error)
                callback(errorToStatus(error))
            }
        },
        formatFileSystem: async (_call, callback) => {
            try {
                logger.debug('Recieved format request from RPC client')
                await fileServerRepo.formatFileSystem()
                callback(null, {})
            } catch (error) {
                logger.error(error)
                callback(errorToStatus(error))
            }
        },
        upload: async (call) => {
            logger.debug('Recieved upload request from RPC client')

            try {
                // Listen for incoming streaming data. The first request will have an empty chunk
                const filename = await new Promise((res, rej) => {
                    call.on('error', (err) => {
                        rej(err)
                    })
                    call.on('data', async ({ filename, chunk }) => {
                        if (!chunk.length) {
                            call.pause()
                            res(filename)
                        }
                    })
                })

                const writeStream = await fileServerRepo.createUploadStream(filename)
                await pipelineAsync(
                    call,
                    createMessageToBytesTransformStream(),
                    writeStream,
                )
            } catch (error) {
                call.destroy(errorToStatus(error))
                logger.error('Error uploading file =>', error)
            }
        },
        download: async (call) => {
            logger.info('Recieved download request from RPC client')

            try {
                const { filename, options } = call.request
                const readStream = await fileServerRepo.createDownloadStream(filename, options)
                await pipelineAsync(
                    readStream,
                    createBytesToMessageTransformStream(filename),
                    call,
                )
            } catch (error) {
                call.destroy(errorToStatus(error))
                logger.error('Error downloading file =>', error)
            }
        },
    },
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

const errorToStatus = (err) => {
    let code
    switch (err.code) {
        case 'ENOENT' || 404:
            code = status.NOT_FOUND
            break
        default:
            code = status.UNKNOWN
            break
    }

    return { message: err.message, code }
}