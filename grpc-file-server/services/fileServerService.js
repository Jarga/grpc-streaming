const domain = require('../domain')
const logger = require('../logging').create('service')
const { Transform, pipeline } = require('stream')
const util = require('util')
const pipelineAsync = util.promisify(pipeline)
const { status } = require('grpc')

module.exports.create = async ({ fileServerRepo }) => ({
    service: domain.FileServer.service,
    implementation: {
        getFileInfo: async (call, callback) => {
            try {
                logger.debug('Received file info request from RPC client')
                const { filename } = call.request
                const file = await fileServerRepo.getFileInfo({ filename })
                callback(null, { file })
            } catch (error) {
                logger.error('Error getting file info => ', error)
                callback(errorToStatus(error))
            }
        },
        removeFile: async (call, callback) => {
            try {
                logger.debug('Received remove file request from RPC client')
                const { filename } = call.request
                await fileServerRepo.removeFile({ filename })
                callback(null)
            } catch (error) {
                logger.error('Error removing file => ', error)
                callback(errorToStatus(error))
            }
        },
        listFiles: async (call, callback) => {
            try {
                logger.debug('Received list files request from RPC client')
                const { filter } = call.request
                const filterObj = JSON.parse(filter)
                const files = await fileServerRepo.listFiles(filterObj)
                callback(null, { files })
            } catch (error) {
                logger.error('Error listing files => ', error)
                callback(errorToStatus(error))
            }
        },
        formatFileSystem: async (_call, callback) => {
            try {
                logger.debug('Received format request from RPC client')
                await fileServerRepo.formatFileSystem()
                callback(null)
            } catch (error) {
                logger.error('Error formatting file system => ', error)
                callback(errorToStatus(error))
            }
        },
        upload: async (call, callback) => {
            logger.debug('Received upload request from RPC client')

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

                const file = await fileServerRepo.getFileInfo({ _id: writeStream.id })
                callback(null, { file })
            } catch (error) {
                call.destroy(errorToStatus(error))
                logger.error('Error uploading file =>', error)
            }
        },
        download: async (call) => {
            logger.info('Received download request from RPC client')

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