/**
 * https://mongodb.github.io/node-mongodb-native/3.0/tutorials/gridfs/streaming/
 */
const logger = require('../logging').create('filer-server-repo')
const assert = require('assert')
const config = require('config')
const mongodb = require('mongodb')
const dbName = 'fileServer'
const { connectionUri } = config.mongodb

module.exports.write = async (fileName, fileStream) => {
    logger.info('Connecting to MongoDB [%s]', connectionUri)
    const client = new mongodb.MongoClient(connectionUri)
    const db = client.db(dbName)
    const bucket = new mongodb.GridFSBucket(db, {
        chunkSizeBytes: 1024,
        bucketName: 'files',
    })

    logger.info('Writing file [%s] to [%s]', dbName, fileName)

    const writeStream = bucket.openUploadStream(fileName)
        .on('error', (error) => {
            logger.error('Error writing file [%s]', fileName)
            assert.ifError(error)
        })
        .on('finish', () => {
            logger.error('Completed writing file [%s]', fileName)
        })

    fileStream.pipe(writeStream)
}

module.exports.read = async (fileName) => {
    logger.info('Connecting to MongoDB [%s]', connectionUri)
    const client = new mongodb.MongoClient(connectionUri)
    const db = client.db(dbName)
    const bucket = new mongodb.GridFSBucket(db, {
        chunkSizeBytes: 1024,
        bucketName: 'files',
    })

    logger.info('Reading file [%s] to [%s]', dbName, fileName)
    const readStream = bucket.openDownloadStreamByName('meistersinger.mp3')
        .on('error', (error) => {
            logger.error('Error reading file [%s]', fileName)
            assert.ifError(error)
        })
        .on('finish', () => {
            logger.error('Completed reading file [%s]', fileName)
        })

    return readStream
}