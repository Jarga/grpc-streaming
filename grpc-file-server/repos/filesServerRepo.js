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
        listFiles: async (filter = {}) => {
            logger.debug('Listing all documents from [%s.%s] using filter [%o]', dbName, bucketName, filter)
            const cursor = await bucket.find(filter, { limit: 100 })
            return await cursor.toArray()
        },
        formatFileSystem: async () => {
            logger.debug('Removing all documents from [%s.%s]', dbName, bucketName)
            const cursor = await bucket.find({}, { limit: 1 })
            const files = await cursor.toArray()
            if (files.length) {
                await bucket.drop()
            }

        },
        createUploadStream: async (filename) => {
            logger.debug('Uploading file [%s] to [%s.%s]', filename, dbName, bucketName)
            return bucket.openUploadStream(filename)
        },
        createDownloadStream: async (filename, options) => {
            logger.debug('Reading file [%s] to [%s]', dbName, filename)
            return await bucket.openDownloadStreamByName(filename, options)
        },
    }
}