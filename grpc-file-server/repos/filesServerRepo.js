const logger = require('../logging').create('repo')
const config = require('config')
const mongodb = require('mongodb')
const dbName = 'fileServer'
const bucketName = 'fileSystem'
const { connectionUri, gridFsBucketSize } = config.mongodb
const { ObjectID } = mongodb

module.exports.create = async () => {
    logger.info('Connecting to MongoDB [%s]', connectionUri)
    const client = new mongodb.MongoClient(connectionUri, { useNewUrlParser: true })
    await client.connect()

    const db = client.db(dbName)
    const bucket = new mongodb.GridFSBucket(db, {
        chunkSizeBytes: gridFsBucketSize,
        bucketName,
    })

    // Ensure we have valid indexes
    db.collection(`${bucketName}.files`).createIndex({
        'filename': 1,
        'uploadDate': 1,
    })

    return {
        getFileInfo: async (id) => {
            logger.debug('Getting file info from [%s.%s] by [%s]', dbName, bucketName, id)
            const cursor = await bucket.find({ _id: ObjectID(id) }, { limit: 1 })
            const [file] = await cursor.toArray()
            if (!file) {
                const err = new Error('File not found')
                err.code = 'ENOENT'
                throw err
            }

            const { _id, ...rest } = file
            return { id: _id, ...rest }
        },
        removeFile: async (id) => {
            logger.debug('Deleting from [%s.%s] by [%s] ', dbName, bucketName, id)
            await bucket.delete(ObjectID(id))
        },
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
        createDownloadStream: async (id, options) => {
            logger.debug('Downloading file [%s] from [%s.%s]', id, dbName, bucketName)
            return await bucket.openDownloadStream(ObjectID(id), options)
        },
    }
}