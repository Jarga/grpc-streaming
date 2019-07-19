const logger = require('../logging').create('repo')
const assert = require('assert')
const config = require('config')
const mongodb = require('mongodb')
const dbName = 'fileServer'
const bucketName = 'fileSystem'
const { connectionUri } = config.mongodb

module.exports.create = async () => {
    logger.info('Connecting to MongoDB [%s]', connectionUri)
    const client = new mongodb.MongoClient(connectionUri, { useNewUrlParser: true })
    await client.connect()

    const db = client.db(dbName)
    const bucket = new mongodb.GridFSBucket(db, {
        chunkSizeBytes: 1024,
        bucketName,
    })

    return {
        formatFileSystem: async () => {
            logger.debug('Removing all documents from [%s.%s]', dbName, bucketName)
            await bucket.drop()
        },
        createUploadStream: async (filename) => {
            logger.debug('Uploading file [%s] to [%s.%s]', filename, dbName, bucketName)

            return bucket.openUploadStream(filename)
                .on('error', (error) => {
                    logger.error('Error uploading file [%s]', filename)
                    assert.ifError(error)
                })
                .on('finish', () => {
                    logger.info('Completed uploading file [%s]', filename)
                })
        },
        createDownloadStream: async (filename) => {
            logger.debug('Reading file [%s] to [%s]', dbName, filename)

            const cursor = await bucket.find({ filename })
            const [file] = await cursor.toArray()
            return await bucket.openDownloadStream(file._id)
                .on('error', (error) => {
                    logger.error('Error uploading file [%s]', filename)
                    assert.ifError(error)
                })
                .on('finish', () => {
                    logger.info('Completed uploading file [%s]', filename)
                })
        },
    }
}